import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  CaseType,
  CasePriority,
  AssignmentStatus,
  ServiceProviderType,
  Prisma,
  ReportStatus,
  MessageAudience,
} from '@prisma/client';
import { CreateCaseAssignmentDto } from '../dto/create-case-assignment.dto';
import { reportBaseSelect } from '../../reports/constants/report-selects';
import { MessagingService } from '../../messaging/services/messaging.service';

@Injectable()
export class CaseManagementService {
  private readonly logger = new Logger(CaseManagementService.name);

  constructor(
    private prisma: PrismaService,
    private messagingService: MessagingService,
  ) {}

  private static readonly INVITE_PENDING = 'PENDING';
  private static readonly INVITE_ACCEPTED = 'ACCEPTED';
  private static readonly INVITE_DECLINED = 'DECLINED';

  private parseAssignmentNotes(notes?: string | null): {
    summary?: string;
    invitations: Record<
      string,
      {
        providerType?: string;
        status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
        invitedAt: string;
        respondedAt?: string;
      }
    >;
  } {
    if (!notes) {
      return { invitations: {} };
    }

    try {
      const parsed = JSON.parse(notes);
      if (!parsed || typeof parsed !== 'object') {
        return { summary: notes, invitations: {} };
      }

      const metadata = parsed as {
        summary?: string;
        invitations?: Record<
          string,
          {
            providerType?: string;
            status?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
            invitedAt?: string;
            respondedAt?: string;
          }
        >;
      };

      const safeInvitations =
        metadata.invitations && typeof metadata.invitations === 'object'
          ? (Object.fromEntries(
              Object.entries(metadata.invitations).map(([providerId, invite]) => [
                providerId,
                {
                  providerType: invite?.providerType,
                  status:
                    invite?.status === CaseManagementService.INVITE_ACCEPTED ||
                    invite?.status === CaseManagementService.INVITE_DECLINED
                      ? invite.status
                      : CaseManagementService.INVITE_PENDING,
                  invitedAt: invite?.invitedAt || new Date().toISOString(),
                  ...(invite?.respondedAt ? { respondedAt: invite.respondedAt } : {}),
                },
              ]),
            ) as Record<
              string,
              {
                providerType?: string;
                status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
                invitedAt: string;
                respondedAt?: string;
              }
            >)
          : {};

      return {
        ...(metadata.summary ? { summary: metadata.summary } : {}),
        invitations: safeInvitations,
      };
    } catch {
      return { summary: notes, invitations: {} };
    }
  }

  private serializeAssignmentNotes(metadata: {
    summary?: string;
    invitations: Record<
      string,
      {
        providerType?: string;
        status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
        invitedAt: string;
        respondedAt?: string;
      }
    >;
  }): string {
    return JSON.stringify(metadata);
  }

  private ensureProviderInvitationStatus(
    notes: string | null | undefined,
    providers: Array<{ id: string; type: string }>,
    summary?: string | null,
  ): string {
    const metadata = this.parseAssignmentNotes(notes);
    if (summary !== undefined && summary !== null && summary.trim().length > 0) {
      metadata.summary = summary.trim();
    }

    for (const provider of providers) {
      const existing = metadata.invitations[provider.id];
      metadata.invitations[provider.id] = {
        providerType: provider.type,
        status:
          existing?.status === CaseManagementService.INVITE_ACCEPTED
            ? CaseManagementService.INVITE_ACCEPTED
            : CaseManagementService.INVITE_PENDING,
        invitedAt: existing?.invitedAt || new Date().toISOString(),
        ...(existing?.respondedAt ? { respondedAt: existing.respondedAt } : {}),
      };
    }

    return this.serializeAssignmentNotes(metadata);
  }

  private normalizeCareCaseType(caseType?: CaseType | null): CaseType {
    // Cases that inherently need both medical and legal support
    const needsCombinedSupport: CaseType[] = [
      CaseType.EMERGENCY_SUPPORT,
      CaseType.COMBINED_SUPPORT,
    ];

    // Upgrade to combined support for complex cases
    if (caseType && needsCombinedSupport.includes(caseType)) {
      return CaseType.COMBINED_SUPPORT;
    }

    // Respect the ML classification for proper routing
    // This ensures workplace abuse → legal, physical violence → medical, etc.
    return caseType || CaseType.LEGAL_ASSISTANCE;
  }

  /**
   * Case flows do not need contactEmail; excluding it prevents failures
   * on databases that haven't added Report.contactEmail yet.
   */
  private getCaseReportSelect(): Prisma.ReportSelect {
    const { contactEmail, ...selectWithoutContactEmail } = reportBaseSelect as any;
    return selectWithoutContactEmail as Prisma.ReportSelect;
  }

  /**
   * Automatically route case to appropriate professional based on classification
   */
  /**
   * Auto-route case: Analyze report and return ML-based routing suggestions.
   * Does NOT create CaseAssignment — counselor must explicitly call assignCase().
   */
  async autoRouteCase(reportId: string): Promise<{
    reportId: string;
    suggestedCaseType: CaseType;
    suggestedPriority: CasePriority;
    suggestedProfessionals: {
      primary: any;
      additional: any[];
    };
    availabilityWarning?: string;
  }> {
    this.logger.log(`Generating routing suggestions for report: ${reportId}`);

    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      select: {
        ...this.getCaseReportSelect(),
        caseAssignment: true,
      },
    });

    if (!report) {
      throw new BadRequestException('Report not found');
    }

    if (report.caseAssignment) {
      throw new ConflictException('Case already assigned');
    }

    const normalizedCaseType = this.normalizeCareCaseType(
      (report.suggestedCaseType as CaseType) || null,
    );

    // Update report with normalized case type if needed
    if (report.suggestedCaseType !== normalizedCaseType) {
      await this.prisma.report.update({
        where: { id: reportId },
        data: { suggestedCaseType: normalizedCaseType },
        select: { id: true },
      });
    }

    const isCombinedSupport = normalizedCaseType === CaseType.COMBINED_SUPPORT;
    let medicalProviders: any[] = [];
    let legalProviders: any[] = [];

    if (isCombinedSupport) {
      [medicalProviders, legalProviders] = await Promise.all([
        this.findAvailableProfessionals(
          [ServiceProviderType.MEDICAL_PROFESSIONAL],
          report.location ?? undefined,
        ),
        this.findAvailableProfessionals(
          [ServiceProviderType.LEGAL_ADVISOR],
          report.location ?? undefined,
        ),
      ]);
    }

    let primaryProfessional: any;
    const additionalProfessionals: any[] = [];
    let availabilityWarning: string | undefined;

    if (isCombinedSupport) {
      primaryProfessional =
        this.selectBestProfessional(medicalProviders, report.severity) ||
        this.selectBestProfessional(legalProviders, report.severity);

      // Add complementary provider
      if (primaryProfessional?.type === ServiceProviderType.MEDICAL_PROFESSIONAL && legalProviders.length > 0) {
        additionalProfessionals.push(this.selectBestProfessional(legalProviders, report.severity));
      } else if (primaryProfessional?.type === ServiceProviderType.LEGAL_ADVISOR && medicalProviders.length > 0) {
        additionalProfessionals.push(this.selectBestProfessional(medicalProviders, report.severity));
      }

      if (!medicalProviders.length || !legalProviders.length) {
        availabilityWarning = 'Combined support requires both medical and legal professionals. Some providers are unavailable.';
      }
    }

    if (!primaryProfessional) {
      const serviceProviderTypes = this.mapCaseTypeToProviders(normalizedCaseType);
      const availableProfessionals = await this.findAvailableProfessionals(
        serviceProviderTypes,
        report.location ?? undefined,
      );

      if (availableProfessionals.length === 0) {
        throw new BadRequestException('No available professionals for this case type');
      }

      primaryProfessional = this.selectBestProfessional(
        availableProfessionals,
        report.severity,
      );
    }

    return {
      reportId,
      suggestedCaseType: normalizedCaseType,
      suggestedPriority: this.mapSeverityToPriority(report.severity),
      suggestedProfessionals: {
        primary: primaryProfessional,
        additional: additionalProfessionals,
      },
      ...(availabilityWarning && { availabilityWarning }),
    };
  }
  /**
   * Manually assign case to specific professional.
   * This is the ONLY method that creates CaseAssignment records.
   */
  async assignCase(
    reportId: string,
    dto: CreateCaseAssignmentDto,
    adminId: string,
  ): Promise<any> {
    this.logger.log(
      `Manual case assignment by admin ${adminId} for report ${reportId}`,
    );

    // Check for existing assignment FIRST
    const existingAssignment = await this.prisma.caseAssignment.findUnique({
      where: { reportId },
      include: {
        assignedTo: true,
        supportProviders: true,
      },
    });

    if (existingAssignment) {
      throw new ConflictException('Case already assigned. Use update endpoint to modify assignment.');
    }

    const [report, serviceProvider, user] = await Promise.all([
      this.prisma.report.findUnique({
        where: { id: reportId },
        select: {
          ...this.getCaseReportSelect(),
        },
      }),
      this.prisma.serviceProvider.findUnique({
        where: { id: dto.assignedToId },
      }),
      this.prisma.user.findUnique({
        where: { id: dto.assignedToId },
      }),
    ]);

    if (!report) {
      throw new BadRequestException('Report not found');
    }

    // Check if professional exists in either ServiceProvider or User table
    const professional = serviceProvider || user;
    if (!professional) {
      throw new BadRequestException('Professional not found');
    }

    const normalizedCaseType = this.normalizeCareCaseType(dto.caseType);

    // Create new assignment with ACTIVE status (counselor has reviewed and assigned)
    let caseAssignment = await this.prisma.caseAssignment.create({
      data: {
        reportId,
        assignedToId: dto.assignedToId,
        assignedById: adminId,
        caseType: normalizedCaseType,
        priority: dto.priority || CasePriority.MEDIUM,
        notes: dto.notes || `Manually assigned by counselor/admin`,
        status: AssignmentStatus.ACTIVE,
      },
      include: {
        assignedTo: true,
        supportProviders: true,
      },
    });

    // Ensure both medical and legal providers are attached for combined support.
    // This only applies to COMBINED_SUPPORT case types
    const isCombinedSupport = normalizedCaseType === CaseType.COMBINED_SUPPORT;

    if (isCombinedSupport) {
      // Determine the assigned professional's type (ServiceProvider has 'type', User has 'role')
      const assignedType = 'type' in professional
        ? professional.type
        : professional.role;

      // Find the complementary provider type that needs to be added
      // Cast to string to handle both ServiceProvider.type (enum) and User.role (enum with overlapping values)
      const assignedTypeStr = String(assignedType);
      let complementaryType: ServiceProviderType | null = null;
      if (assignedTypeStr === 'MEDICAL_PROFESSIONAL') {
        complementaryType = ServiceProviderType.LEGAL_ADVISOR;
      } else if (assignedTypeStr === 'LEGAL_ADVISOR') {
        complementaryType = ServiceProviderType.MEDICAL_PROFESSIONAL;
      }

      if (complementaryType) {
        // Check if complementary provider is already in support providers
        const hasComplementaryProvider = caseAssignment.supportProviders.some(
          (p: any) => p.type === complementaryType
        );

        if (!hasComplementaryProvider) {
          // Find available provider of the complementary type
          const complementaryProviders = await this.findAvailableProfessionals(
            [complementaryType],
            report.location ?? undefined,
          );

          // Select the best professional based on rating and case severity
          const bestMatch = this.selectBestProfessional(
            complementaryProviders.filter((p) => p.id !== caseAssignment.assignedToId),
            report.severity,
          );

          if (bestMatch) {
            caseAssignment = await this.prisma.caseAssignment.update({
              where: { id: caseAssignment.id },
              data: {
                supportProviders: {
                  connect: { id: bestMatch.id },
                },
              },
              include: {
                assignedTo: true,
                supportProviders: true,
              },
            });
          }
        }
      }
    }

    const invitedProviders = [
      {
        id: caseAssignment.assignedTo.id,
        type: caseAssignment.assignedTo.type,
      },
      ...caseAssignment.supportProviders.map((provider: any) => ({
        id: provider.id,
        type: provider.type,
      })),
    ];

    caseAssignment = await this.prisma.caseAssignment.update({
      where: { id: caseAssignment.id },
      data: {
        notes: this.ensureProviderInvitationStatus(
          caseAssignment.notes,
          invitedProviders,
          dto.notes || undefined,
        ),
      },
      include: {
        assignedTo: true,
        supportProviders: true,
      },
    });

    // Update report status to ASSIGNED when assignment is activated
    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.ASSIGNED,
      },
      select: {
        id: true,
      },
    });

    // Generate or get tracking number for anonymous access
    const trackingNumber = await this.messagingService.assignTrackingNumber(reportId);

    // Create system message for case assignment
    const supportProvidersList = caseAssignment.supportProviders
      .map((p: any) => p.name || `${p.firstName} ${p.lastName}`)
      .join(', ');

    // Handle different property names for ServiceProvider vs User
    const professionalName = 'name' in professional
      ? professional.name
      : `${professional.firstName} ${professional.lastName}`;
    const professionalType = 'type' in professional
      ? professional.type
      : professional.role;

    const systemMessage = `Your case has been assigned to ${professionalName} (${this.formatProviderType(professionalType)})` +
      (supportProvidersList ? ` with additional support from ${supportProvidersList}` : '') +
      `. Reference: ${trackingNumber}`;

    try {
      await this.messagingService.createSystemMessage(reportId, systemMessage, MessageAudience.SURVIVOR);
      this.logger.log(`[assignCase] Survivor notification created for report ${reportId}`);

      // Notify professional they were assigned to a case
      const survivorName = report.isAnonymous
        ? 'an anonymous survivor'
        : `${report.reporter?.firstName || ''} ${report.reporter?.lastName || ''}`.trim() || 'a survivor';
      const category = report.category || 'General';
      const severity = report.severity || 'Unknown';
      const professionalNotification = `You have been assigned to ${survivorName}'s case (${category}). ` +
        `Severity: ${severity}. Please review the case details and begin providing support.`;
      await this.messagingService.createSystemMessage(reportId, professionalNotification, MessageAudience.ASSIGNED_PROFESSIONAL);
      this.logger.log(`[assignCase] Professional notification created for report ${reportId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[assignCase] Failed to create system messages: ${errorMessage}`, error);
    }

    this.logger.log(
      `Case manually assigned to ${professionalName}, tracking: ${trackingNumber}`,
    );

    await this.createAuditLog(
      'ASSIGN_CASE',
      caseAssignment.id,
      {
        assignedToId: dto.assignedToId,
        caseType: normalizedCaseType,
        priority: dto.priority,
        supportProviders: caseAssignment.supportProviders.map(p => p.id),
      },
      adminId,
    );

    return this.prisma.caseAssignment.findUnique({
      where: { id: caseAssignment.id },
      include: {
        assignedTo: true,
        supportProviders: true,
      },
    });
  }

  /**
   * Get all cases (admin view)
   */
  async getAllCases(
    page: number = 1,
    limit: number = 20,
    status?: AssignmentStatus,
  ) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [cases, total] = await Promise.all([
      this.prisma.caseAssignment.findMany({
        where,
        include: {
          report: {
            select: {
              ...this.getCaseReportSelect(),
            },
          },
          assignedTo: true,
          supportProviders: true,
          feedbacks: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.caseAssignment.count({ where }),
    ]);

    return {
      data: cases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get case assignment by ID
   * Also accepts report IDs and returns report data if no case assignment exists
   */
  async getCaseById(caseId: string, userId?: string) {
    // First try to find as case assignment
    const caseAssignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
      include: {
        report: {
          select: {
            ...this.getCaseReportSelect(),
            reporter: true,
            caseComments: true,
          },
        },
        assignedTo: true,
        supportProviders: true,
        feedbacks: true,
      },
    });

    // If not found as case assignment, try to find as report ID
    if (!caseAssignment) {
      const report = await this.prisma.report.findUnique({
        where: { id: caseId },
        select: {
          ...this.getCaseReportSelect(),
          reporter: true,
          caseComments: true,
        },
      });

      if (report) {
        // Return a synthetic case structure with the report
        return {
          id: `pending-${report.id}`,
          reportId: report.id,
          report: report,
          status: 'PENDING_ASSIGNMENT',
          priority: report.suggestedPriority || 'MEDIUM',
          caseType: report.suggestedCaseType || 'GENERAL',
          assignedTo: null,
          supportProviders: [],
          feedbacks: [],
          createdAt: report.createdAt,
          updatedAt: report.updatedAt,
        };
      }
    }

    if (!caseAssignment) {
      throw new BadRequestException('Case not found');
    }

    return caseAssignment;
  }

  /**
   * Get all cases for a professional
   */
  async getCasesForProfessional(
    professionalId: string,
    page: number = 1,
    limit: number = 20,
    includePending: boolean = false,
  ) {
    const resolvedProfessionalId =
      (await this.resolveProfessionalIdentifier(professionalId)) || professionalId;
    const allCases = await this.prisma.caseAssignment.findMany({
      where: {
        OR: [
          { assignedToId: resolvedProfessionalId },
          { supportProviders: { some: { id: resolvedProfessionalId } } },
        ],
      },
      include: {
        report: {
          select: {
            ...this.getCaseReportSelect(),
            reporter: true,
            caseComments: true,
          },
        },
        assignedTo: true,
        supportProviders: true,
        feedbacks: true,
      },
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      take: 500,
    });

    const withInvitationStatus = allCases.map((caseItem) => {
      const metadata = this.parseAssignmentNotes(caseItem.notes);
      const inviteStatus =
        metadata.invitations[resolvedProfessionalId]?.status ||
        CaseManagementService.INVITE_PENDING;
      return {
        ...caseItem,
        invitationStatus: inviteStatus,
      };
    });

    const filteredCases = withInvitationStatus.filter((caseItem) =>
      includePending
        ? caseItem.invitationStatus !== CaseManagementService.INVITE_DECLINED
        : caseItem.invitationStatus === CaseManagementService.INVITE_ACCEPTED,
    );

    const total = filteredCases.length;
    const skip = (page - 1) * limit;
    const cases = filteredCases.slice(skip, skip + limit);

    return {
      data: cases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getMyInvitations(userId?: string, role?: string) {
    if (!userId || !role) {
      throw new ForbiddenException('Unable to resolve authenticated user');
    }

    const provider = await this.resolveProviderForUser(userId, role);
    if (!provider) {
      throw new ForbiddenException('No linked provider profile found');
    }

    const assignments = await this.prisma.caseAssignment.findMany({
      where: {
        report: {
          reporterId: { not: null },
          isAnonymous: false,
        },
        OR: [
          { assignedToId: provider.id },
          { supportProviders: { some: { id: provider.id } } },
        ],
      },
      include: {
        report: {
          select: {
            id: true,
            title: true,
            description: true,
            severity: true,
            status: true,
            createdAt: true,
          },
        },
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
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return assignments.map((assignment) => {
      const metadata = this.parseAssignmentNotes(assignment.notes);
      const invitation = metadata.invitations[provider.id];
      const status = invitation?.status || CaseManagementService.INVITE_PENDING;
      return {
        caseId: assignment.id,
        reportId: assignment.reportId,
        reportTitle: assignment.report.title,
        reportSeverity: assignment.report.severity,
        reportStatus: assignment.report.status,
        caseType: assignment.caseType,
        roleInCase:
          assignment.assignedToId === provider.id ? 'PRIMARY' : 'SUPPORT',
        invitationStatus: status,
        invitedAt: invitation?.invitedAt || assignment.createdAt.toISOString(),
        respondedAt: invitation?.respondedAt || null,
      };
    });
  }

  async respondToInvitation(
    caseId: string,
    userId: string | undefined,
    role: string | undefined,
    action: 'ACCEPT' | 'DECLINE' | undefined,
  ) {
    if (!userId || !role) {
      throw new ForbiddenException('Unable to resolve authenticated user');
    }
    if (!action || !['ACCEPT', 'DECLINE'].includes(action)) {
      throw new BadRequestException('Action must be ACCEPT or DECLINE');
    }

    const provider = await this.resolveProviderForUser(userId, role);
    if (!provider) {
      throw new ForbiddenException('No linked provider profile found');
    }

    const assignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
      include: {
        assignedTo: true,
        supportProviders: true,
      },
    });

    if (!assignment) {
      throw new BadRequestException('Case assignment not found');
    }

    const isLinked =
      assignment.assignedToId === provider.id ||
      assignment.supportProviders.some((item) => item.id === provider.id);
    if (!isLinked) {
      throw new ForbiddenException(
        'You are not assigned to this case invitation',
      );
    }

    const metadata = this.parseAssignmentNotes(assignment.notes);
    const existing = metadata.invitations[provider.id];
    metadata.invitations[provider.id] = {
      providerType: provider.type,
      status:
        action === 'ACCEPT'
          ? CaseManagementService.INVITE_ACCEPTED
          : CaseManagementService.INVITE_DECLINED,
      invitedAt: existing?.invitedAt || new Date().toISOString(),
      respondedAt: new Date().toISOString(),
    };

    const updated = await this.prisma.caseAssignment.update({
      where: { id: caseId },
      data: {
        notes: this.serializeAssignmentNotes(metadata),
        ...(action === 'ACCEPT' ? { status: AssignmentStatus.ACTIVE } : {}),
      },
      include: {
        assignedTo: true,
        supportProviders: true,
      },
    });

    return {
      caseId: updated.id,
      invitationStatus: metadata.invitations[provider.id].status,
      respondedAt: metadata.invitations[provider.id].respondedAt,
    };
  }

  /**
   * Update case status
   */
  async updateCaseStatus(
    caseId: string,
    newStatus: AssignmentStatus | 'IN_PROGRESS' | 'REJECTED',
    feedback?: string,
    userId?: string,
  ) {
    const effectiveAssignmentStatus =
      newStatus === 'IN_PROGRESS'
        ? AssignmentStatus.ACTIVE
        : newStatus === 'REJECTED'
          ? AssignmentStatus.CANCELLED
          : newStatus;

    const caseAssignment = await this.prisma.caseAssignment.update({
      where: { id: caseId },
      data: {
        status: effectiveAssignmentStatus,
        completedAt:
          effectiveAssignmentStatus === AssignmentStatus.COMPLETED
            ? new Date()
            : null,
      },
      include: {
        report: {
          select: {
            ...this.getCaseReportSelect(),
          },
        },
      },
    });

    // Keep parent report lifecycle aligned with professional case progress.
    if (newStatus === 'IN_PROGRESS') {
      await this.prisma.report.update({
        where: { id: caseAssignment.reportId },
        data: {
          status: ReportStatus.IN_SUPPORT,
        },
        select: {
          id: true,
        },
      });
    }

    // Update report status if case completed
    if (effectiveAssignmentStatus === AssignmentStatus.COMPLETED) {
      await this.prisma.report.update({
        where: { id: caseAssignment.reportId },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
        },
        select: {
          id: true,
        },
      });
    }

    if (newStatus === 'REJECTED') {
      await this.prisma.report.update({
        where: { id: caseAssignment.reportId },
        data: {
          status: 'REJECTED',
        },
        select: { id: true },
      });
    }

    await this.createAuditLog(
      'UPDATE_CASE_STATUS',
      caseId,
      { status: effectiveAssignmentStatus, feedback: feedback || 'No feedback provided' },
      userId,
    );

    return this.prisma.caseAssignment.findUnique({
      where: { id: caseAssignment.id },
      include: {
        assignedTo: true,
        supportProviders: true,
      },
    });
  }

  /**
   * Cancel case assignment
   */
  async cancelCase(caseId: string) {
    const existingCase = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
      include: { report: { select: { id: true, status: true } } },
    });

    if (!existingCase) {
      throw new BadRequestException('Case not found');
    }

    const updatedCase = await this.prisma.caseAssignment.update({
      where: { id: caseId },
      data: {
        status: AssignmentStatus.CANCELLED,
        completedAt: new Date(),
      },
      include: {
        report: {
          select: {
            ...this.getCaseReportSelect(),
          },
        },
        assignedTo: true,
      },
    });

    if (existingCase.report?.status === ReportStatus.ASSIGNED) {
      await this.prisma.report.update({
        where: { id: existingCase.report.id },
        data: { status: ReportStatus.RECEIVED },
        select: { id: true },
      });
    }

    return updatedCase;
  }

  private async resolveProfessionalIdentifier(
    professionalIdOrUserId: string,
  ): Promise<string | null> {
    const asUser = await this.prisma.user.findUnique({
      where: { id: professionalIdOrUserId },
      select: { id: true, role: true },
    });

    if (!asUser) {
      return professionalIdOrUserId;
    }

    if (
      asUser.role !== 'COUNSELOR' &&
      asUser.role !== 'MEDICAL_PROFESSIONAL' &&
      asUser.role !== 'LEGAL_ADVISOR'
    ) {
      return professionalIdOrUserId;
    }

    const provider = await this.resolveProviderForUser(asUser.id, asUser.role);
    return provider?.id || professionalIdOrUserId;
  }

  private async resolveProviderForUser(userId: string, role: string) {
    const providerRoleTypes: Record<string, ServiceProviderType> = {
      COUNSELOR: ServiceProviderType.COUNSELOR,
      MEDICAL_PROFESSIONAL: ServiceProviderType.MEDICAL_PROFESSIONAL,
      LEGAL_ADVISOR: ServiceProviderType.LEGAL_ADVISOR,
    };

    const providerType = providerRoleTypes[role];
    if (!providerType) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!user) return null;

    // Strict match: provider type aligned with user role
    const existing = await this.prisma.serviceProvider.findFirst({
      where: {
        type: providerType,
        OR: [{ email: user.email }, { phone: user.phone || undefined }],
      },
      select: {
        id: true,
        type: true,
        name: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) return existing;

    // Fallback: any provider linked to this user (handles role/type mismatches)
    const anyLinkedProvider = await this.prisma.serviceProvider.findFirst({
      where: {
        OR: [{ email: user.email }, { phone: user.phone || undefined }],
      },
      select: {
        id: true,
        type: true,
        name: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (anyLinkedProvider) return anyLinkedProvider;

    const fallbackName =
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      (providerType === ServiceProviderType.MEDICAL_PROFESSIONAL
        ? 'Medical Provider'
        : providerType === ServiceProviderType.LEGAL_ADVISOR
          ? 'Legal Advisor'
          : 'Counselor');

    return this.prisma.serviceProvider.create({
      data: {
        name: fallbackName,
        type: providerType,
        email: user.email,
        phone: user.phone || null,
        isVerified: true,
        languages: ['en'],
        specializations: [],
        description: `Auto-linked provider profile for user ${user.id}`,
      },
      select: {
        id: true,
        type: true,
        name: true,
      },
    });
  }

  /**
   * Find available professionals by type and location
   */
  private async findAvailableProfessionals(
    providerTypes: ServiceProviderType[],
    _location?: string,
  ): Promise<any[]> {
    const strictMatch = await this.prisma.serviceProvider.findMany({
      where: {
        type: { in: providerTypes },
        isVerified: true,
        AND: [
          {
            OR: [
              { availability: { contains: 'available' } },
              { availability: { contains: 'open' } },
            ],
          },
        ],
      },
      include: {
        reviews: true,
      },
      orderBy: {
        rating: 'desc',
      },
      take: 10,
    });

    if (strictMatch.length > 0) {
      return strictMatch;
    }

    // Fallback 1: verified providers without enforcing availability text.
    const verifiedFallback = await this.prisma.serviceProvider.findMany({
      where: {
        type: { in: providerTypes },
        isVerified: true,
      },
      include: { reviews: true },
      orderBy: { rating: 'desc' },
      take: 10,
    });

    if (verifiedFallback.length > 0) {
      return verifiedFallback;
    }

    // Fallback 2: any provider by type, so auto-routing doesn't stall completely.
    return this.prisma.serviceProvider.findMany({
      where: {
        type: { in: providerTypes },
      },
      include: { reviews: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
  }

  /**
   * Select best professional based on rating, experience, and case severity
   */
  private selectBestProfessional(professionals: any[], severity: string): any {
    // Weight selection based on severity and ratings
    let bestScore = -1;
    let selected = professionals[0];

    for (const professional of professionals) {
      let score = professional.rating || 0;

      // Critical cases: prioritize high-rated specialists
      if (severity === 'CRITICAL') {
        score = (professional.rating || 0) * 2;
      }

      // Check if professional has relevant specialization
      if (
        professional.specializations &&
        professional.specializations.length > 0
      ) {
        score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        selected = professional;
      }
    }

    return selected;
  }

  /**
   * Map case type to required service provider types
   */
  private mapCaseTypeToProviders(caseType: CaseType): ServiceProviderType[] {
    const mapping = {
      [CaseType.COUNSELING]: [ServiceProviderType.COUNSELOR],
      [CaseType.MEDICAL_SUPPORT]: [ServiceProviderType.MEDICAL_PROFESSIONAL],
      [CaseType.LEGAL_ASSISTANCE]: [ServiceProviderType.LEGAL_ADVISOR],
      [CaseType.EMERGENCY_SUPPORT]: [
        ServiceProviderType.NGO,
        ServiceProviderType.GOVERNMENT_AGENCY,
      ],
      [CaseType.PREVENTION_EDUCATION]: [ServiceProviderType.NGO],
      [CaseType.RESOURCE_REFERRAL]: [ServiceProviderType.HOTLINE],
      [CaseType.COMBINED_SUPPORT]: [
        ServiceProviderType.MEDICAL_PROFESSIONAL,
        ServiceProviderType.LEGAL_ADVISOR,
      ],
    };

    return mapping[caseType] || [ServiceProviderType.NGO];
  }

  /**
   * Map severity to case priority
   */
  private mapSeverityToPriority(severity: string): CasePriority {
    const mapping: Record<string, CasePriority> = {
      CRITICAL: CasePriority.CRITICAL,
      HIGH: CasePriority.HIGH,
      MEDIUM: CasePriority.MEDIUM,
      LOW: CasePriority.LOW,
    };

    return mapping[severity] || CasePriority.MEDIUM;
  }

  /**
   * Calculate due date based on severity
   */
  private calculateDueDate(severity: string): Date {
    const date = new Date();

    switch (severity) {
      case 'CRITICAL':
        date.setDate(date.getDate() + 1); // 1 day
        break;
      case 'HIGH':
        date.setDate(date.getDate() + 3); // 3 days
        break;
      case 'MEDIUM':
        date.setDate(date.getDate() + 7); // 7 days
        break;
      default:
        date.setDate(date.getDate() + 14); // 14 days
    }

    return date;
  }

  /**
   * Get case statistics
   */
  async getCaseStats() {
    const stats = await this.prisma.caseAssignment.groupBy({
      by: ['caseType', 'priority', 'status'],
      _count: true,
    });

    return {
      byType: stats,
      averageResolutionDays: 7, // Placeholder
    };
  }

  /**
   * Get pending/unassigned cases for counselors to review
   */
  async getPendingCasesForReview(
    page: number = 1,
    limit: number = 20,
    status?: AssignmentStatus,
  ) {
    const where: Prisma.CaseAssignmentWhereInput = {
      status: status || AssignmentStatus.ON_HOLD,
    };

    const [cases, total] = await Promise.all([
      this.prisma.caseAssignment.findMany({
        where,
        include: {
          report: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              severity: true,
              classificationScore: true,
              classificationLabel: true,
              suggestedCaseType: true,
              riskScore: true,
              isAnonymous: true,
              createdAt: true,
              location: true,
              trackingNumber: true,
              reporter: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.caseAssignment.count({ where }),
    ]);

    return {
      data: cases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get unassigned reports for counselors to review and assign
   */
  async getUnassignedReportsForReview(
    page: number = 1,
    limit: number = 20,
  ) {
    const where: Prisma.ReportWhereInput = {
      caseAssignment: null, // Only reports without case assignments
      status: 'PENDING_REVIEW', // Only reports that are ready for review
    };

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          severity: true,
          classificationScore: true,
          classificationLabel: true,
          suggestedCaseType: true,
          classificationConfirmed: true,
          riskScore: true,
          isAnonymous: true,
          createdAt: true,
          location: true,
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          caseAssignment: true, // Include to confirm null
        },
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update case classification (confirm or override)
   */
  async updateCaseClassification(
    caseId: string,
    classificationData: {
      category?: string;
      severity?: string;
      caseType?: CaseType;
      notes?: string;
    },
    counselorId: string,
  ) {
    const caseAssignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
      include: { report: true },
    });

    if (!caseAssignment) {
      throw new BadRequestException('Case not found');
    }

    // Update the report with confirmed classification
    const updatedReport = await this.prisma.report.update({
      where: { id: caseAssignment.reportId },
      data: {
        category: classificationData.category as any,
        severity: classificationData.severity as any,
        suggestedCaseType: classificationData.caseType,
      },
    });

    // Update case priority based on severity
    const priority = this.mapSeverityToPriority(classificationData.severity || 'LOW');
    const updatedCase = await this.prisma.caseAssignment.update({
      where: { id: caseId },
      data: {
        priority,
        caseType: classificationData.caseType || caseAssignment.caseType,
        notes: JSON.stringify({
          ...this.parseAssignmentNotes(caseAssignment.notes),
          classificationOverride: {
            originalCategory: caseAssignment.report.category,
            newCategory: classificationData.category,
            overriddenBy: counselorId,
            overriddenAt: new Date().toISOString(),
            notes: classificationData.notes,
          },
        }),
      },
    });

    return {
      case: updatedCase,
      report: updatedReport,
    };
  }

  // Case Comments / Messaging methods
  async getCaseComments(caseId: string, userId: string, role?: string) {
    // Verify user has access to this case
    const caseAssignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
      include: {
        report: {
          include: {
            caseComments: {
              orderBy: { createdAt: 'asc' },
              include: {
                author: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
        supportProviders: true,
      },
    });

    if (!caseAssignment) {
      throw new NotFoundException('Case not found');
    }

    // Check access - must be assigned professional, admin, or the reporter
    // Resolve user ID to provider ID for professionals
    const resolvedProfessionalId = await this.resolveProfessionalIdentifier(userId);
    const isAssignedProfessional = caseAssignment.assignedToId === userId || 
                                  caseAssignment.assignedToId === resolvedProfessionalId ||
                                  caseAssignment.supportProviders?.some((sp: any) => sp.id === userId || sp.id === resolvedProfessionalId);
    const isAdmin = role === 'ADMIN' || role === 'SYSTEM';
    const isReporter = caseAssignment.report?.reporterId === userId;
    const isCounselor = role === 'COUNSELOR';

    if (!isAssignedProfessional && !isAdmin && !isReporter && !isCounselor) {
      throw new ForbiddenException('Access denied to this case');
    }

    // Filter messages by audience based on viewer's role
    const visibleAudiences = this.getVisibleAudiences(
      isReporter,
      isAssignedProfessional,
      isCounselor,
      isAdmin,
    );

    return caseAssignment.report?.caseComments
      ?.filter((comment: any) => {
        // Show all non-system messages, or system messages with matching audience
        if (!comment.isSystemMessage) return true;
        return visibleAudiences.includes(comment.audience);
      })
      ?.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        user: {
          id: comment.author?.id || (comment.isSystemMessage ? 'system' : 'anonymous'),
          firstName: comment.author
            ? comment.author.firstName || ''
            : comment.isSystemMessage
              ? 'System'
              : 'Anonymous',
          lastName: comment.author?.lastName || '',
          role: comment.author?.role || (comment.isSystemMessage ? 'SYSTEM' : 'SURVIVOR'),
        },
        isInternal: !comment.isPublic,
        timestamp: comment.createdAt,
        isSentByMe: comment.author?.id === userId,
      })) || [];
  }

  /**
   * Determine which message audiences are visible to the current user
   */
  private getVisibleAudiences(
    isSurvivor: boolean,
    isAssignedProfessional: boolean,
    isCounselor: boolean,
    isAdmin: boolean,
  ): MessageAudience[] {
    // Admins and counselors see all messages
    if (isAdmin || isCounselor) {
      return [
        MessageAudience.ALL,
        MessageAudience.SURVIVOR,
        MessageAudience.ASSIGNED_PROFESSIONAL,
        MessageAudience.SUPPORT_PROVIDER,
        MessageAudience.COUNSELOR,
      ];
    }

    // Survivors see messages for them, general messages, and counselor notifications
    if (isSurvivor) {
      return [MessageAudience.ALL, MessageAudience.SURVIVOR, MessageAudience.COUNSELOR];
    }

    // Assigned professionals see messages for them, general messages, and counselor notifications
    if (isAssignedProfessional) {
      return [MessageAudience.ALL, MessageAudience.ASSIGNED_PROFESSIONAL, MessageAudience.COUNSELOR];
    }

    // Support providers see messages for them and general messages
    return [MessageAudience.ALL, MessageAudience.SUPPORT_PROVIDER, MessageAudience.COUNSELOR];
  }

  async addCaseComment(
    caseId: string,
    userId: string,
    content: string,
    isInternal: boolean = false,
  ) {
    const caseAssignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
      include: { report: true },
    });

    if (!caseAssignment || !caseAssignment.report) {
      throw new NotFoundException('Case not found');
    }

    const comment = await this.prisma.caseComment.create({
      data: {
        content,
        isPublic: !isInternal,
        reportId: caseAssignment.report.id,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return {
      id: comment.id,
      content: comment.content,
      user: {
        id: comment.author?.id || '',
        name: comment.author ? `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || 'Unknown' : 'System',
        role: comment.author?.role || 'SYSTEM',
      },
      isInternal: !comment.isPublic,
      timestamp: comment.createdAt,
      isSentByMe: true,
    };
  }

  async deleteCaseComment(
    commentId: string,
    userId: string,
    role?: string,
  ) {
    const comment = await this.prisma.caseComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Only the author or admin can delete
    if (comment.authorId !== userId && role !== 'ADMIN' && role !== 'SYSTEM') {
      throw new ForbiddenException('Cannot delete this comment');
    }

    await this.prisma.caseComment.delete({
      where: { id: commentId },
    });

    return { success: true };
  }

  /**
   * Format provider type for display in system messages
   */
  private formatProviderType(type: string): string {
    const typeMap: Record<string, string> = {
      'COUNSELOR': 'Counselor',
      'MEDICAL_PROFESSIONAL': 'Medical Professional',
      'LEGAL_ADVISOR': 'Legal Advisor',
      'NGO': 'Support Organization',
      'GOVERNMENT_AGENCY': 'Government Agency',
      'COMMUNITY_CENTER': 'Community Center',
      'SHELTER': 'Shelter',
      'HOTLINE': 'Crisis Hotline',
    };
    return typeMap[type] || type;
  }

  /**
   * Internal Audit Logger
   */
  private async createAuditLog(
    action: string,
    entityId: string,
    changes: any,
    userId?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          entityType: 'CaseAssignment',
          entityId,
          changes: JSON.stringify(changes),
          userId: userId || null,
        },
      });
    } catch (error: unknown) {
      this.logger.warn(`Audit Log Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
