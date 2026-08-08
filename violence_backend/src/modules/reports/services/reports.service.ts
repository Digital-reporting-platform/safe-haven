import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  ClassificationService,
  ClassificationResult,
  RiskScoreResult,
} from '../../classification/services/classification.service';
import {
  LocationValidationService,
  LocationValidationResult,
} from './location-validation.service';
import { NotificationService } from '../../notification/notification.service';
import { CaseType, Prisma, ReportStatus, UserRole } from '@prisma/client';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { reportBaseSelect } from '../constants/report-selects';
import { ReportFilters } from '../types/report-filters.type';
import {
  hashIP,
  mapSeverityToPriority,
  normalizeIpAddress,
} from '../utils/report.utils';
import { CaseManagementService } from '@/modules/cases/services/case-management.service';
import { StatusWorkflowService } from '@/modules/workflow/services/status-workflow.service';
import * as crypto from 'crypto';

export interface ReportCreationResult {
  report: any;
  classification: ClassificationResult;
  riskScore: RiskScoreResult;
  locationValidation?: LocationValidationResult;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private prisma: PrismaService,
    private classificationService: ClassificationService,
    private locationValidationService: LocationValidationService,
    private notificationService: NotificationService,
    private caseManagementService: CaseManagementService,
    private statusWorkflowService: StatusWorkflowService,
  ) {}

  private normalizeCareCaseType(caseType: string | null | undefined): string {
    if (
      caseType === 'MEDICAL_SUPPORT' ||
      caseType === 'LEGAL_ASSISTANCE' ||
      caseType === 'COMBINED_SUPPORT'
    ) {
      return caseType;
    }
    return 'LEGAL_ASSISTANCE';
  }

  /**
   * Main method to create a report
   */
  async createReport(dto: CreateReportDto, userId?: string, skipLocationValidation?: boolean): Promise<ReportCreationResult> {
    this.logger.log(`Processing report creation for: ${dto.title}`);

    // 1. IP Normalization & Behavioral Limit (3 per 24 hours)
    const normalizedIp = normalizeIpAddress(dto.ipAddress) || '127.0.0.1';
    const isAnonymous = dto.isAnonymous ?? true;
    await this.checkRateLimit(
      normalizedIp,
      userId,
      isAnonymous,
      dto.deviceFingerprint || null,
    );

    // 2. Location Validation (if location provided and not skipped)
    let locationValidation: LocationValidationResult | undefined;
    if (dto.location && !skipLocationValidation) {
      try {
        locationValidation = await this.locationValidationService.validateLocation(
          dto.location,
          normalizedIp,
          dto.gpsLat,
          dto.gpsLng,
        );
        this.logger.log(`Location validation result: ${JSON.stringify({
          hasMismatch: locationValidation.hasMismatch,
          detectedRegion: locationValidation.detectedLocation.region,
          selectedRegion: dto.location,
        })}`);
      } catch (error) {
        this.logger.warn(`Location validation failed: ${error}`);
        locationValidation = undefined;
      }
    }

    try {
      // 3. ML Classification
      const classification = await this.classificationService.classifyReport(
        dto.description,
        dto.language || 'en',
      );
      const normalizedCaseType = this.normalizeCareCaseType(
        classification.suggestedCaseType as unknown as string,
      );
      const normalizedClassification: ClassificationResult = {
        ...classification,
        suggestedCaseType: normalizedCaseType as CaseType,
      };

      // 4. Risk Scoring (Safe handling of behavioralData)
      const behavioralData = (dto as any).behavioralData;
      const riskScore = await this.classificationService.calculateRiskScore(
        dto.description,
        normalizedIp,
        dto.deviceFingerprint || null,
        behavioralData,
      );

      // 5. Generate tracking number for anonymous reports
      const trackingNumber = isAnonymous ? this.generateTrackingNumber() : undefined;

      // 6. Save to Database with Retry Logic (GPS/IP Hash Fallbacks)
      const reportSelect = { ...reportBaseSelect, reporter: true } satisfies Prisma.ReportSelect;
      const report = await this.saveWithRetry(
        dto, 
        userId, 
        isAnonymous, 
        normalizedIp, 
        normalizedClassification,
        riskScore, 
        reportSelect,
        locationValidation,
        trackingNumber,
      );

      // 6. Report created successfully - ready for counselor review
      this.logger.log(`Report created successfully: ${report.id} - Classification: ${classification.category}`);

      // 7. Audit Logging
      await this.createAuditLog(
        'CREATE_REPORT',
        report.id,
        { 
          category: classification.category, 
          risk: riskScore.riskScore, 
          isAnonymous,
          locationMismatch: locationValidation?.hasMismatch,
        },
        userId,
        normalizedIp,
      );

      // Ensure tracking number is in the returned report
      if (trackingNumber && !report.trackingNumber) {
        report.trackingNumber = trackingNumber;
      }

      return { 
        report, 
        classification: normalizedClassification, 
        riskScore,
        locationValidation,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create report: ${msg}`, error instanceof Error ? error.stack : undefined);
      
      if (error instanceof BadRequestException) throw error;
      throw new Error(`Report Creation Failed: ${msg}`);
    }
  }

  /**
   * Validate location and return warning if mismatch detected (without creating report)
   */
  async validateLocation(
    selectedRegion: string,
    ipAddress: string,
    gpsLat?: number,
    gpsLng?: number,
  ): Promise<LocationValidationResult> {
    return this.locationValidationService.validateLocation(
      selectedRegion,
      ipAddress,
      gpsLat,
      gpsLng,
    );
  }

  /**
   * Requirement: User can report 2 times a day only
   */
  private async checkRateLimit(
    ip: string,
    userId?: string,
    isAnonymous: boolean = true,
    deviceFingerprint?: string | null,
  ) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const useUserLimit = !isAnonymous && !!userId;
    const useDeviceLimit = isAnonymous && !!deviceFingerprint && deviceFingerprint !== 'unknown';

    const reportCount = await this.prisma.report.count({
      where: useUserLimit
        ? {
            reporterId: userId,
            createdAt: { gte: twentyFourHoursAgo },
          }
        : useDeviceLimit
          ? {
              deviceFingerprint,
              createdAt: { gte: twentyFourHoursAgo },
            }
        : {
            ipAddress: ip,
            createdAt: { gte: twentyFourHoursAgo },
          },
    });

    if (reportCount >= 3) {
      this.logger.warn(
        useUserLimit
          ? `Rate limit exceeded for user: ${userId}`
          : useDeviceLimit
            ? `Rate limit exceeded for deviceFingerprint: ${deviceFingerprint}`
          : `Rate limit exceeded for IP: ${ip}`,
      );
      throw new BadRequestException('Security Limit: You can only submit 3 reports per 24-hour period. Please try again tomorrow.');
    }
  }

  /**
   * Generate a unique tracking number for anonymous access.
   * Format: REF-XXXXXX (6 characters from an unambiguous alphabet)
   */
  private generateTrackingNumber(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded I, O, 0, 1 for clarity
    const bytes = crypto.randomBytes(6);
    let result = 'REF-';
    for (let i = 0; i < 6; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  /**
   * Handles Database persistence with schema fallbacks
   */
  private async saveWithRetry(
    dto: CreateReportDto,
    userId: string | undefined,
    isAnonymous: boolean,
    ip: string,
    classification: ClassificationResult,
    risk: RiskScoreResult,
    select: Prisma.ReportSelect,
    locationValidation?: LocationValidationResult,
    trackingNumber?: string,
  ) {
    const reportData = this.buildReportCreateData(
      dto, 
      userId, 
      isAnonymous, 
      ip, 
      classification, 
      risk, 
      true,
      locationValidation,
      trackingNumber,
    );

    try {
      return await this.createWithSelectFallback(reportData, select);
    } catch (error: unknown) {
      // Handle Missing GPS Columns
      if (this.isMissingGpsColumnError(error)) {
        this.logger.warn('GPS columns missing in DB; retrying without GPS');
        const noGpsData = this.buildReportCreateData(
          dto, 
          userId, 
          isAnonymous, 
          ip, 
          classification, 
          risk, 
          false,
          locationValidation,
          trackingNumber,
        );
        return this.createWithSelectFallback(noGpsData, select);
      }

      // Handle IP Hash Unique Conflict
      if (this.isIpHashConflict(error)) {
        this.logger.warn('ipHash conflict; retrying without hash');
        const retryData: Prisma.ReportCreateInput = { ...reportData, ipHash: null };
        return this.createWithSelectFallback(retryData, select);
      }

      const msg = error instanceof Error ? error.message : 'DB Failure';
      throw new Error(msg);
    }
  }

  private async createWithSelectFallback(
    data: Prisma.ReportCreateInput,
    select: Prisma.ReportSelect,
  ) {
    try {
      return await this.prisma.report.create({ data, select });
    } catch (error: unknown) {
      if (this.isMissingContactEmailColumnError(error)) {
        this.logger.warn('contactEmail column missing in DB; retrying without contactEmail select field');
        const { contactEmail, ...selectWithoutContactEmail } = select as any;
        return this.prisma.report.create({
          data,
          select: selectWithoutContactEmail as Prisma.ReportSelect,
        });
      }
      throw error;
    }
  }

  private buildReportCreateData(
    dto: CreateReportDto,
    userId: string | undefined,
    isAnonymous: boolean,
    normalizedIpAddress: string,
    classification: ClassificationResult,
    riskScore: RiskScoreResult,
    includeGps: boolean,
    locationValidation?: LocationValidationResult,
    trackingNumber?: string,
  ): Prisma.ReportCreateInput {
    // REQUIREMENT: If anonymous, remove the link to the user
    const connectUser = !isAnonymous && userId ? { connect: { id: userId } } : undefined;

    const reportData: Prisma.ReportCreateInput = {
      reporter: connectUser,
      title: dto.title,
      description: dto.description,
      category: dto.category || classification.category,
      severity: classification.severity,
      isAnonymous,
      language: dto.language || 'en',
      location: dto.location || null,
      ...(includeGps ? {
        gpsLat: (dto as any).gpsLat ?? null,
        gpsLng: (dto as any).gpsLng ?? null,
      } : {}),
      ipAddress: normalizedIpAddress.substring(0, 50),
      ipHash: hashIP(normalizedIpAddress),
      deviceFingerprint: dto.deviceFingerprint || 'unknown',
      classificationScore: classification.confidence,
      classificationLabel: classification.category,
      suggestedCaseType: classification.suggestedCaseType,
      suggestedPriority: mapSeverityToPriority(classification.severity),
      riskScore: riskScore.riskScore,
      flaggedAsRepetitive: riskScore.isRepetitive || (dto as any).flaggedForLocation === true || locationValidation?.hasMismatch === true,
      isDuplicate: riskScore.isDuplicate,
      status: ReportStatus.PENDING_REVIEW,
      ...(trackingNumber ? { trackingNumber } : {}),
    };

    if (locationValidation) {
      reportData.detectedCountry = locationValidation.detectedLocation.country;
      reportData.detectedRegion = locationValidation.detectedLocation.region;
      reportData.detectedCity = locationValidation.detectedLocation.city;
      reportData.locationMismatchWarning = locationValidation.hasMismatch;
      reportData.locationMismatchConfirmed = (dto as any).locationMismatchConfirmed === true;
    }

    return reportData;
  }

  // --- Prisma Error Helpers ---

  private isIpHashConflict(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      this.getPrismaErrorTarget(error).includes('ipHash')
    );
  }

  private isMissingGpsColumnError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2022' &&
      typeof (error as any).message === 'string' &&
      ((error as any).message.includes('gpsLat') || (error as any).message.includes('gpsLng'))
    );
  }

  private isMissingContactEmailColumnError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2022' &&
      typeof (error as any).message === 'string' &&
      (error as any).message.includes('Report.contactEmail')
    );
  }

  private removeContactEmailFromSelect(
    select: Prisma.ReportSelect,
  ): Prisma.ReportSelect {
    const { contactEmail, ...selectWithoutContactEmail } = select as any;
    return selectWithoutContactEmail as Prisma.ReportSelect;
  }

  private getPrismaErrorTarget(error: unknown): string[] {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return [];
    const target = error.meta?.target;
    if (Array.isArray(target)) return target.map(String);
    if (typeof target === 'string') return [target];
    return [];
  }

  // --- Standard CRUD Methods ---

  async getReport(reportId: string, requesterId?: string, requesterRole?: string) {
    const reportSelect: Prisma.ReportSelect = {
      ...reportBaseSelect,
      reporter: { select: { id: true, email: true } },
      evidences: true,
      caseAssignment: { include: { assignedTo: true } },
    };

    let report: any;
    try {
      report = await this.prisma.report.findUnique({
        where: { id: reportId },
        select: reportSelect,
      });
    } catch (error) {
      if (!this.isMissingContactEmailColumnError(error)) throw error;
      this.logger.warn('contactEmail column missing in DB; retrying getReport without contactEmail');
      report = await this.prisma.report.findUnique({
        where: { id: reportId },
        select: this.removeContactEmailFromSelect(reportSelect),
      });
    }

    if (!report) throw new BadRequestException('Report not found');

    // Survivors can only access their own reports
    if (requesterRole === UserRole.SURVIVOR) {
      if (!report.reporterId || report.reporterId !== requesterId) {
        throw new ForbiddenException('You can only access your own reports');
      }
    }

    return report;
  }

  async getAllReports(page: number = 1, limit: number = 20, filters?: ReportFilters) {
    const skip = (page - 1) * limit;
    const where: Prisma.ReportWhereInput = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.reporterId && { reporterId: filters.reporterId }),
    };
    let reports: any[] = [];
    let total = 0;

    try {
      [reports, total] = await Promise.all([
        this.prisma.report.findMany({ where, skip, take: limit, select: reportBaseSelect, orderBy: { createdAt: 'desc' } }),
        this.prisma.report.count({ where }),
      ]);
    } catch (error) {
      if (!this.isMissingContactEmailColumnError(error)) throw error;
      this.logger.warn('contactEmail column missing in DB; retrying getAllReports without contactEmail');
      [reports, total] = await Promise.all([
        this.prisma.report.findMany({
          where,
          skip,
          take: limit,
          select: this.removeContactEmailFromSelect(reportBaseSelect),
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.report.count({ where }),
      ]);
    }

    return { data: reports, pagination: { total, pages: Math.ceil(total / limit) } };
  }

  async getAllReportsForUser(
    page: number = 1,
    limit: number = 20,
    filters: ReportFilters | undefined,
    userId?: string,
    role?: string,
  ) {
    if (role === UserRole.SURVIVOR && userId) {
      const scopedFilters: ReportFilters = {
        ...(filters || {}),
        reporterId: userId,
      };
      return this.getAllReports(page, limit, scopedFilters);
    }

    return this.getAllReports(page, limit, filters);
  }

  async getSurvivorSupportDecision(userId: string) {
    const latestReport = await this.prisma.report.findFirst({
      where: { reporterId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        suggestedCaseType: true,
        caseAssignment: {
          select: {
            id: true,
            caseType: true,
            status: true,
            createdAt: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            supportProviders: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!latestReport) {
      return {
        hasReport: false,
        supportTrack: 'NONE',
        destination: '/survivor/dashboard',
      };
    }

    const caseType = String(
      latestReport.caseAssignment?.caseType || latestReport.suggestedCaseType || 'LEGAL_ASSISTANCE',
    );
    const supportTrack =
      caseType === 'MEDICAL_SUPPORT'
        ? 'MEDICAL'
        : caseType === 'COMBINED_SUPPORT'
          ? 'BOTH'
          : 'LEGAL';

    return {
      hasReport: true,
      destination: '/survivor/my-cases',
      supportTrack,
      latestReport: {
        id: latestReport.id,
        title: latestReport.title,
        status: latestReport.status,
        createdAt: latestReport.createdAt,
        suggestedCaseType: latestReport.suggestedCaseType,
        caseType,
      },
      assignment: latestReport.caseAssignment
        ? {
            id: latestReport.caseAssignment.id,
            status: latestReport.caseAssignment.status,
            createdAt: latestReport.caseAssignment.createdAt,
            primaryProvider: latestReport.caseAssignment.assignedTo,
            supportProviders: latestReport.caseAssignment.supportProviders,
          }
        : null,
    };
  }

  async getHighRiskReports(limit: number = 50) {
    try {
      return await this.prisma.report.findMany({
        where: {
          riskScore: { gte: 70 },
          status: ReportStatus.PENDING_REVIEW,
        },
        take: limit,
        select: reportBaseSelect,
        orderBy: { riskScore: 'desc' },
      });
    } catch (error) {
      if (!this.isMissingContactEmailColumnError(error)) throw error;
      this.logger.warn('contactEmail column missing in DB; retrying getHighRiskReports without contactEmail');
      return this.prisma.report.findMany({
        where: {
          riskScore: { gte: 70 },
          status: ReportStatus.PENDING_REVIEW,
        },
        take: limit,
        select: this.removeContactEmailFromSelect(reportBaseSelect),
        orderBy: { riskScore: 'desc' },
      });
    }
  }

  async getReportAnalytics(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const [
      totalReports,
      reportsByCategory,
      reportsBySeverity,
      resolvedCount,
      avgResolutionTime,
      anonymousCount,
    ] = await Promise.all([
      this.prisma.report.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.report.groupBy({
        by: ['category'],
        _count: true,
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.report.groupBy({
        by: ['severity'],
        _count: true,
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.report.count({ 
        where: { 
          createdAt: { gte: startDate },
          status: ReportStatus.RESOLVED,
        } 
      }),
      this.prisma.report.aggregate({
        _avg: { riskScore: true },
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.report.count({ 
        where: { 
          createdAt: { gte: startDate },
          isAnonymous: true,
        } 
      }),
    ]);

    return {
      totalReports,
      reportsByCategory: reportsByCategory.map((r) => ({ category: r.category, count: r._count })),
      reportsBySeverity: reportsBySeverity.map((r) => ({ severity: r.severity, count: r._count })),
      resolutionRate: totalReports > 0 ? (resolvedCount / totalReports) * 100 : 0,
      averageRiskScore: avgResolutionTime._avg.riskScore || 0,
      anonymousReportCount: anonymousCount,
      publicReportCount: totalReports - anonymousCount,
    };
  }

  async addEvidence(
    reportId: string,
    fileUrl: string,
    fileName: string,
    fileType: string,
    fileSize: number,
  ) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new BadRequestException('Report not found');
    }

    return this.prisma.evidence.create({
      data: {
        reportId,
        fileUrl,
        fileName,
        fileType,
        fileSize,
      },
    });
  }

  async updateReport(reportId: string, dto: UpdateReportDto, userId?: string, userRole?: UserRole) {
    let existingReport:
      | { status: ReportStatus; contactEmail?: string | null; category: any }
      | null;
    try {
      existingReport = await this.prisma.report.findUnique({
        where: { id: reportId },
        select: { status: true, contactEmail: true, category: true },
      });
    } catch (error) {
      if (!this.isMissingContactEmailColumnError(error)) throw error;
      this.logger.warn('contactEmail column missing in DB; notifications by email will be skipped');
      existingReport = await this.prisma.report.findUnique({
        where: { id: reportId },
        select: { status: true, category: true },
      });
    }

    if (!existingReport) {
      throw new BadRequestException('Report not found');
    }

    // If a status change is requested, route it through the workflow service
    // which enforces valid transitions and role permissions
    if (dto.status !== undefined && dto.status !== existingReport.status) {
      if (!userId || !userRole) {
        throw new ForbiddenException('Authentication required for status updates');
      }
      await this.statusWorkflowService.transitionStatus(
        reportId,
        dto.status,
        userId,
        userRole,
        { notes: dto.classificationNotes },
      );
    }

    // Build update data for non-status fields only
    const updateData: any = {};
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.severity !== undefined) updateData.severity = dto.severity;
    if (dto.suggestedCaseType !== undefined) updateData.suggestedCaseType = dto.suggestedCaseType;
    if (dto.classificationConfirmed !== undefined) updateData.classificationConfirmed = dto.classificationConfirmed;

    let report: any;
    if (Object.keys(updateData).length > 0) {
      try {
        report = await this.prisma.report.update({
          where: { id: reportId },
          data: updateData,
          select: reportBaseSelect,
        });
      } catch (error) {
        if (!this.isMissingContactEmailColumnError(error)) throw error;
        this.logger.warn('contactEmail column missing in DB; retrying updateReport without contactEmail');
        report = await this.prisma.report.update({
          where: { id: reportId },
          data: updateData,
          select: this.removeContactEmailFromSelect(reportBaseSelect),
        });
      }
    } else {
      // No non-status fields to update — fetch the current state
      report = await this.prisma.report.findUnique({
        where: { id: reportId },
        select: reportBaseSelect,
      });
    }

    await this.createAuditLog('UPDATE_REPORT', reportId, {
      status: dto.status,
      category: dto.category,
      severity: dto.severity,
      suggestedCaseType: dto.suggestedCaseType,
      classificationNotes: dto.classificationNotes,
    }, userId);

    if (existingReport?.contactEmail && dto.status && dto.status !== existingReport.status) {
      try {
        await this.notificationService.sendReportStatusUpdate(
          existingReport.contactEmail,
          reportId,
          dto.status,
          existingReport.category,
        );
        this.logger.log(`Status update notification sent for report ${reportId}`);
      } catch (error) {
        this.logger.warn(`Failed to send status update notification: ${(error as Error).message}`);
      }
    }

    return report;
  }

  async updateReportContactEmail(reportId: string, contactEmail: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new BadRequestException('Report not found');
    }

    let updatedReport: any;
    try {
      updatedReport = await this.prisma.report.update({
        where: { id: reportId },
        data: { contactEmail },
        select: reportBaseSelect,
      });
    } catch (error) {
      if (!this.isMissingContactEmailColumnError(error)) throw error;
      throw new BadRequestException(
        'Database column Report.contactEmail is missing. Please run Prisma migrations.',
      );
    }
    
    await this.createAuditLog('UPDATE_CONTACT_EMAIL', reportId, { contactEmail: 'updated' });
    return updatedReport;
  }

  /**
   * Internal Audit Logger with safe Error handling
   */
  private async createAuditLog(action: string, reportId: string, changes: any, userId?: string, ip?: string) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          entityType: 'Report',
          entityId: reportId,
          changes: JSON.stringify(changes),
          userId: userId || null,
          ipAddress: ip || null,
        },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Audit Log Failed: ${msg}`);
    }
  }
}
