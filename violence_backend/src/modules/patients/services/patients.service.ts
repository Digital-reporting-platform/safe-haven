import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CaseManagementService } from '@/modules/cases/services/case-management.service';
import { Prisma } from '@prisma/client';
import { UpdatePatientDto } from '../dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly caseManagementService: CaseManagementService,
  ) {}

  private getMedicalReportFilter(): Prisma.ReportWhereInput {
    return {
      OR: [
        { suggestedCaseType: { in: ['MEDICAL_SUPPORT', 'COMBINED_SUPPORT'] } },
        { caseAssignment: { is: { caseType: { in: ['MEDICAL_SUPPORT', 'COMBINED_SUPPORT'] } } } },
      ],
    };
  }

  private getLegalReportFilter(): Prisma.ReportWhereInput {
    return {
      OR: [
        { suggestedCaseType: { in: ['LEGAL_ASSISTANCE', 'COMBINED_SUPPORT'] } },
        { caseAssignment: { is: { caseType: { in: ['LEGAL_ASSISTANCE', 'COMBINED_SUPPORT'] } } } },
      ],
    };
  }

  private getCareReportFilter(): Prisma.ReportWhereInput {
    return {
      OR: [this.getMedicalReportFilter(), this.getLegalReportFilter()],
    };
  }

  private getRoleNotificationFilter(role?: string): Prisma.ReportWhereInput {
    if (role === 'LEGAL_ADVISOR') {
      return this.getLegalReportFilter();
    }

    if (role === 'ADMIN') {
      return {
        OR: [this.getMedicalReportFilter(), this.getLegalReportFilter()],
      };
    }

    return this.getMedicalReportFilter();
  }

  private isMedicalCareRole(role?: string) {
    return ['MEDICAL_PROFESSIONAL', 'ADMIN', 'COUNSELOR'].includes(role || '');
  }

  private isCareRole(role?: string) {
    return ['MEDICAL_PROFESSIONAL', 'LEGAL_ADVISOR', 'ADMIN', 'COUNSELOR'].includes(role || '');
  }

  private async resolveServiceProviderIdForUser(
    requesterId: string,
    requesterRole: string,
  ): Promise<string | null> {
    if (!['MEDICAL_PROFESSIONAL', 'LEGAL_ADVISOR'].includes(requesterRole)) {
      return null;
    }

    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { email: true, phone: true },
    });

    if (!requester) {
      return null;
    }

    const providerType =
      requesterRole === 'LEGAL_ADVISOR' ? 'LEGAL_ADVISOR' : 'MEDICAL_PROFESSIONAL';
    const provider = await this.prisma.serviceProvider.findFirst({
      where: {
        type: providerType as any,
        OR: [{ email: requester.email }, { phone: requester.phone || undefined }],
      },
      select: { id: true },
      orderBy: { updatedAt: 'desc' },
    });

    return provider?.id || null;
  }

  private assertPatientAccess(patientId: string, requesterId: string, requesterRole?: string) {
    if (requesterRole === 'SURVIVOR' && requesterId !== patientId) {
      throw new ForbiddenException('You can only access your own record');
    }

    if (!requesterRole) {
      throw new ForbiddenException('Missing requester role');
    }

    if (requesterRole !== 'SURVIVOR' && !this.isCareRole(requesterRole)) {
      throw new ForbiddenException('You are not allowed to access this patient record');
    }
  }

  async getPatients(search?: string, status?: string) {
    await this.autoAssignMedicalSupportReports(25);

    const medicalReportFilter = this.getMedicalReportFilter();

    const survivors = await this.prisma.user.findMany({
      where: {
        role: 'SURVIVOR',
        reports: { some: medicalReportFilter },
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        reports: {
          where: medicalReportFilter,
          orderBy: { createdAt: 'desc' },
          include: {
            caseAssignment: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const mapped = survivors.map((survivor) => {
      const latestReport = survivor.reports[0];
      const statusLabel = this.toPatientStatus(latestReport?.status);
      const priorityLabel = this.toPriorityLabel(latestReport?.caseAssignment?.priority);

      return {
        id: survivor.id,
        name: `${survivor.firstName || ''} ${survivor.lastName || ''}`.trim() || survivor.email,
        age: null,
        gender: 'N/A',
        status: statusLabel,
        lastVisit: (latestReport?.updatedAt || survivor.updatedAt).toISOString().split('T')[0],
        priority: priorityLabel,
        assignedByML: latestReport?.suggestedCaseType === 'MEDICAL_SUPPORT',
      };
    });

    if (status && status !== 'All') {
      return mapped.filter((patient) => patient.status === status);
    }

    return mapped;
  }

  async autoAssignMedicalSupportReports(limit = 50) {
    const reports = await this.prisma.report.findMany({
      where: {
        suggestedCaseType: { in: ['MEDICAL_SUPPORT', 'COMBINED_SUPPORT'] },
        caseAssignment: null,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { id: true, suggestedCaseType: true, severity: true },
    });

    let assigned = 0;
    let skipped = 0;

    for (const report of reports) {
      try {
        // Get ML suggestions
        const suggestions = await this.caseManagementService.autoRouteCase(report.id);
        
        // Auto-assign using the suggested professional
        if (suggestions.suggestedProfessionals.primary) {
          await this.caseManagementService.assignCase(
            report.id,
            {
              assignedToId: suggestions.suggestedProfessionals.primary.id,
              caseType: suggestions.suggestedCaseType,
              priority: suggestions.suggestedPriority,
              notes: 'Auto-assigned by system batch process',
            },
            'system', // System user ID
          );
          assigned++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Failed to auto-assign report ${report.id}:`, error);
        skipped++;
      }
    }

    return {
      scanned: reports.length,
      assigned,
      skipped,
    };
  }

  async autoAssignCareReports(limit = 100) {
    const reports = await this.prisma.report.findMany({
      where: {
        caseAssignment: null,
        reporter: { is: { role: 'SURVIVOR' } },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { id: true, suggestedCaseType: true, severity: true },
    });

    let assigned = 0;
    let skipped = 0;

    for (const report of reports) {
      try {
        // Get ML suggestions
        const suggestions = await this.caseManagementService.autoRouteCase(report.id);
        
        // Auto-assign using the suggested professional
        if (suggestions.suggestedProfessionals.primary) {
          await this.caseManagementService.assignCase(
            report.id,
            {
              assignedToId: suggestions.suggestedProfessionals.primary.id,
              caseType: suggestions.suggestedCaseType,
              priority: suggestions.suggestedPriority,
              notes: 'Auto-assigned by system batch process',
            },
            'system', // System user ID
          );
          assigned++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Failed to auto-assign report ${report.id}:`, error);
        skipped++;
      }
    }

    return {
      scanned: reports.length,
      assigned,
      skipped,
    };
  }

  async getMedicalNotifications(hours = 48, limit = 40, requesterRole?: string) {
    const since = new Date(Date.now() - Math.max(hours, 1) * 60 * 60 * 1000);
    const roleFilter = this.getRoleNotificationFilter(requesterRole);
    const isLegalView = requesterRole === 'LEGAL_ADVISOR';
    const isAdminView = requesterRole === 'ADMIN';

    const reports = await this.prisma.report.findMany({
      where: {
        ...roleFilter,
        OR: [{ createdAt: { gte: since } }, { updatedAt: { gte: since } }],
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        caseAssignment: {
          select: {
            id: true,
            caseType: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: Math.max(limit * 2, 40),
    });

    const notifications: Array<{
      id: string;
      type: 'NEW_MEDICAL_ISSUE' | 'UPDATED_MEDICAL_ISSUE' | 'NEW_PERSON_ADDED' | 'NEW_LEGAL_ISSUE' | 'UPDATED_LEGAL_ISSUE';
      title: string;
      description: string;
      timestamp: Date;
      reportId: string;
      patientId: string | null;
      patientName: string;
      caseType?: string;
    }> = [];

    const newPersonSeen = new Set<string>();

    for (const report of reports) {
      const patientName =
        `${report.reporter?.firstName || ''} ${report.reporter?.lastName || ''}`.trim() ||
        report.reporter?.email ||
        'Unknown user';

      if (report.createdAt >= since) {
        const caseType = String(report.caseAssignment?.caseType || report.suggestedCaseType || '');
        const isLegalCase = caseType === 'LEGAL_ASSISTANCE' || caseType === 'COMBINED_SUPPORT';
        const title = isAdminView
          ? `New ${isLegalCase ? 'legal' : 'medical'} issue`
          : isLegalView
            ? 'New legal issue'
            : 'New medical issue';
        const description = isLegalCase
          ? `${patientName} was flagged for legal support${caseType === 'COMBINED_SUPPORT' ? ' and medical support' : ''}.`
          : `${patientName} was flagged for medical support.`;

        notifications.push({
          id: `new-issue-${report.id}`,
          type: isLegalCase ? 'NEW_LEGAL_ISSUE' : 'NEW_MEDICAL_ISSUE',
          title,
          description,
          timestamp: report.createdAt,
          reportId: report.id,
          patientId: report.reporterId,
          patientName,
          caseType,
        });
      }

      if (report.updatedAt >= since && report.updatedAt.getTime() > report.createdAt.getTime()) {
        const caseType = String(report.caseAssignment?.caseType || report.suggestedCaseType || '');
        const isLegalCase = caseType === 'LEGAL_ASSISTANCE' || caseType === 'COMBINED_SUPPORT';
        const title = isAdminView
          ? `${isLegalCase ? 'Legal' : 'Medical'} issue updated`
          : isLegalView
            ? 'Legal issue updated'
            : 'Medical issue updated';

        notifications.push({
          id: `updated-issue-${report.id}`,
          type: isLegalCase ? 'UPDATED_LEGAL_ISSUE' : 'UPDATED_MEDICAL_ISSUE',
          title,
          description: `${patientName} case changed to ${report.status.replace(/_/g, ' ')}.`,
          timestamp: report.updatedAt,
          reportId: report.id,
          patientId: report.reporterId,
          patientName,
          caseType,
        });
      }

      if (report.reporterId && !newPersonSeen.has(report.reporterId)) {
        const firstRoleReport = await this.prisma.report.findFirst({
          where: {
            reporterId: report.reporterId,
            ...roleFilter,
          },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        });

        if (firstRoleReport && firstRoleReport.createdAt >= since) {
          notifications.push({
            id: `new-person-${report.reporterId}`,
            type: 'NEW_PERSON_ADDED',
            title: 'New person added',
            description: `${patientName} entered ${isLegalView ? 'legal' : isAdminView ? 'care' : 'medical'} support workflow.`,
            timestamp: firstRoleReport.createdAt,
            reportId: report.id,
            patientId: report.reporterId,
            patientName,
            caseType: String(report.caseAssignment?.caseType || report.suggestedCaseType || ''),
          });
          newPersonSeen.add(report.reporterId);
        }
      }
    }

    return notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map((item) => ({
        ...item,
        timestamp: item.timestamp.toISOString(),
      }));
  }

  async getPatientRecord(patientId: string, requesterId: string, requesterRole?: string) {
    this.assertPatientAccess(patientId, requesterId, requesterRole);

    const medicalReportFilter = this.getMedicalReportFilter();
    const patient = await this.prisma.user.findFirst({
      where: {
        id: patientId,
        role: 'SURVIVOR',
      },
      include: {
        reports: {
          where: medicalReportFilter,
          orderBy: { createdAt: 'desc' },
          include: {
            caseAssignment: true,
            evidences: true,
            caseComments: {
              include: {
                author: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const reports = patient.reports || [];
    const latestReport = reports[0];

    const medicalHistoryFromReports = reports.map((report) => ({
      date: report.createdAt.toISOString().split('T')[0],
      type: 'Report',
      description: report.title,
      provider: 'SafeHaven System',
      notes: report.description,
    }));

    const medicalHistoryFromNotes = reports.flatMap((report) =>
      report.caseComments.map((comment) => ({
        date: comment.createdAt.toISOString().split('T')[0],
        type: 'Note',
        description: 'Provider note',
        provider:
          comment.author
            ? `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() ||
              comment.author.email ||
              'Provider'
            : 'Provider',
        notes: comment.content,
      })),
    );

    const examinations = reports
      .filter((report) => report.caseAssignment)
      .map((report) => ({
        id: report.caseAssignment!.id,
        date: report.caseAssignment!.createdAt.toISOString().split('T')[0],
        type: this.toReadableCaseType(report.caseAssignment!.caseType),
        status: this.toReadableAssignmentStatus(report.caseAssignment!.status),
        results: report.caseAssignment!.notes || report.description || 'No additional details.',
      }));

    const treatmentPlans = reports
      .filter((report) => report.caseAssignment)
      .map((report) => ({
        id: report.caseAssignment!.id,
        name: `${this.toReadableCaseType(report.caseAssignment!.caseType)} Plan`,
        startDate: report.caseAssignment!.createdAt.toISOString().split('T')[0],
        status: this.toReadableAssignmentStatus(report.caseAssignment!.status),
        description:
          report.caseAssignment!.notes || 'Treatment plan generated from assigned case workflow.',
      }));

    const documents = reports.flatMap((report) =>
      report.evidences.map((evidence) => ({
        id: evidence.id,
        name: evidence.fileName,
        fileType: evidence.fileType,
        uploadedAt: evidence.createdAt.toISOString().split('T')[0],
      })),
    );

    return {
      patient: {
        id: patient.id,
        name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || patient.email,
        age: null,
        gender: 'N/A',
        dob: null,
        phone: patient.phone || 'Not provided',
        email: patient.email || 'Not provided',
        address: 'Not provided',
        emergencyContact: 'Not provided',
        bloodType: 'Unknown',
        allergies: [],
        chronicConditions: [],
        status: this.toPatientStatus(latestReport?.status),
        priority: this.toPriorityLabel(latestReport?.caseAssignment?.priority),
        assignedByML: latestReport?.suggestedCaseType === 'MEDICAL_SUPPORT',
      },
      medicalHistory: [...medicalHistoryFromNotes, ...medicalHistoryFromReports].sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
      examinations,
      treatmentPlans,
      documents,
    };
  }

  async updatePatient(patientId: string, dto: UpdatePatientDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        id: patientId,
        role: 'SURVIVOR',
      },
    });

    if (!existing) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.user.update({
      where: { id: patientId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      },
    });
  }

  async addPatientNote(patientId: string, authorUserId: string, content: string) {
    const medicalReport = await this.findLatestMedicalReportForPatient(patientId);
    if (!medicalReport) {
      throw new BadRequestException('No medical-assigned report found for this patient.');
    }

    return this.prisma.caseComment.create({
      data: {
        reportId: medicalReport.id,
        authorId: authorUserId,
        content,
        isPublic: false,
      },
      select: {
        id: true,
        reportId: true,
        content: true,
        createdAt: true,
      },
    });
  }

  async getChatConversations(requesterId: string, requesterRole: string) {
    if (requesterRole !== 'SURVIVOR' && !this.isCareRole(requesterRole)) {
      throw new ForbiddenException('You are not allowed to access support chat conversations');
    }

    const providerId = await this.resolveServiceProviderIdForUser(
      requesterId,
      requesterRole,
    );
    if (
      ['MEDICAL_PROFESSIONAL', 'LEGAL_ADVISOR'].includes(requesterRole) &&
      !providerId
    ) {
      throw new ForbiddenException(
        'No linked service-provider profile found for this account',
      );
    }

    const where: Prisma.ReportWhereInput =
      requesterRole === 'SURVIVOR'
        ? {
            reporterId: requesterId,
            ...this.getCareReportFilter(),
          }
        : providerId
          ? {
              ...this.getCareReportFilter(),
              caseAssignment: {
                is: {
                  OR: [
                    { assignedToId: providerId },
                    { supportProviders: { some: { id: providerId } } },
                  ],
                },
              },
            }
          : this.getCareReportFilter();

    const reports = await this.prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        caseComments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        caseAssignment: {
          select: {
            id: true,
            caseType: true,
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
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return reports.map((report) => {
      const patientName =
        `${report.reporter?.firstName || ''} ${report.reporter?.lastName || ''}`.trim() ||
        report.reporter?.email ||
        'Unknown user';
      const lastMessage = report.caseComments[0];
      const lastSenderName = lastMessage
        ? lastMessage.author
          ? `${lastMessage.author.firstName || ''} ${lastMessage.author.lastName || ''}`.trim() ||
            lastMessage.author.email ||
            'Unknown'
          : 'System'
        : null;
      const assignedProviders = report.caseAssignment
        ? [
            report.caseAssignment.assignedTo,
            ...report.caseAssignment.supportProviders,
          ].filter(
            (provider, index, arr) =>
              arr.findIndex((candidate) => candidate.id === provider.id) === index,
          )
        : [];

      return {
        reportId: report.id,
        patientId: report.reporterId,
        patientName,
        assignedByML: report.suggestedCaseType === 'MEDICAL_SUPPORT',
        caseType: report.caseAssignment?.caseType || report.suggestedCaseType,
        assignedProviders,
        lastMessage: lastMessage?.content || '',
        lastMessageAt: lastMessage?.createdAt || report.updatedAt,
        lastSenderName,
      };
    });
  }

  async getPatientChat(
    patientId: string,
    requesterId: string,
    requesterRole: string,
    reportId?: string,
  ) {
    this.assertChatAccess(patientId, requesterId, requesterRole);
    const providerId = await this.resolveServiceProviderIdForUser(
      requesterId,
      requesterRole,
    );
    if (
      ['MEDICAL_PROFESSIONAL', 'LEGAL_ADVISOR'].includes(requesterRole) &&
      !providerId
    ) {
      throw new ForbiddenException(
        'No linked service-provider profile found for this account',
      );
    }

    const report = await this.prisma.report.findFirst({
      where: {
        reporterId: patientId,
        ...(reportId ? { id: reportId } : {}),
        ...this.getCareReportFilter(),
        ...(providerId
          ? {
              caseAssignment: {
                is: {
                  OR: [
                    { assignedToId: providerId },
                    { supportProviders: { some: { id: providerId } } },
                  ],
                },
              },
            }
          : {}),
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        caseComments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        caseAssignment: {
          select: {
            id: true,
            caseType: true,
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
      orderBy: { updatedAt: 'desc' },
    });

    if (!report) {
      throw new NotFoundException(
        'No assigned support thread found for this patient',
      );
    }

    const patientName =
      `${report.reporter?.firstName || ''} ${report.reporter?.lastName || ''}`.trim() ||
      report.reporter?.email ||
      'Unknown user';

    const assignedProviders = report.caseAssignment
      ? [report.caseAssignment.assignedTo, ...report.caseAssignment.supportProviders].filter(
          (provider, index, arr) =>
            arr.findIndex((candidate) => candidate.id === provider.id) === index,
        )
      : [];

    return {
      reportId: report.id,
      patientId: report.reporterId,
      patientName,
      assignedByML: report.suggestedCaseType === 'MEDICAL_SUPPORT',
      caseType: report.caseAssignment?.caseType || report.suggestedCaseType,
      assignedProviders,
      messages: report.caseComments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        senderId: comment.author?.id || '',
        senderRole: comment.author?.role || 'SYSTEM',
        senderName: comment.author
          ? `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() ||
            comment.author.email ||
            'Unknown'
          : 'System',
      })),
    };
  }

  async sendPatientChatMessage(
    patientId: string,
    requesterId: string,
    requesterRole: string,
    content: string,
    reportId?: string,
  ) {
    this.assertChatAccess(patientId, requesterId, requesterRole);
    const providerId = await this.resolveServiceProviderIdForUser(
      requesterId,
      requesterRole,
    );
    if (
      ['MEDICAL_PROFESSIONAL', 'LEGAL_ADVISOR'].includes(requesterRole) &&
      !providerId
    ) {
      throw new ForbiddenException(
        'No linked service-provider profile found for this account',
      );
    }

    const report = await this.findLatestCareReportForPatient(
      patientId,
      reportId,
      providerId,
    );
    if (!report) {
      throw new NotFoundException(
        'No assigned support thread found for this patient',
      );
    }

    const message = await this.prisma.caseComment.create({
      data: {
        reportId: report.id,
        authorId: requesterId,
        content,
        isPublic: false,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.author?.id || '',
      senderRole: message.author?.role || 'SYSTEM',
      senderName: message.author
        ? `${message.author.firstName || ''} ${message.author.lastName || ''}`.trim() ||
          message.author.email ||
          'Unknown'
        : 'System',
    };
  }

  private assertChatAccess(patientId: string, requesterId: string, requesterRole: string) {
    if (requesterRole === 'SURVIVOR' && requesterId !== patientId) {
      throw new ForbiddenException('You can only access your own chat thread');
    }

    if (requesterRole === 'SURVIVOR' || this.isCareRole(requesterRole)) {
      return;
    }

    throw new ForbiddenException('You are not allowed to access support chat');
  }

  private async findLatestCareReportForPatient(
    patientId: string,
    reportId?: string,
    providerId?: string | null,
  ) {
    return this.prisma.report.findFirst({
      where: {
        reporterId: patientId,
        ...(reportId ? { id: reportId } : {}),
        ...this.getCareReportFilter(),
        ...(providerId
          ? {
              caseAssignment: {
                is: {
                  OR: [
                    { assignedToId: providerId },
                    { supportProviders: { some: { id: providerId } } },
                  ],
                },
              },
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      select: { id: true },
    });
  }

  private async findLatestMedicalReportForPatient(patientId: string) {
    return this.prisma.report.findFirst({
      where: {
        reporterId: patientId,
        ...this.getMedicalReportFilter(),
      },
      orderBy: { updatedAt: 'desc' },
      select: { id: true },
    });
  }

  private toReadableCaseType(value: string) {
    return value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private toReadableAssignmentStatus(value: string) {
    return value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private toPatientStatus(reportStatus?: string) {
    if (!reportStatus) return 'Active';
    if (reportStatus === 'RESOLVED' || reportStatus === 'CLOSED') return 'Completed';
    if (reportStatus === 'UNDER_INVESTIGATION' || reportStatus === 'IN_PROGRESS') {
      return 'Follow-up';
    }
    return 'Active';
  }

  private toPriorityLabel(priority?: string) {
    if (!priority) return 'Medium';
    const normalized = priority.toLowerCase();
    if (normalized === 'high' || normalized === 'critical') return 'High';
    if (normalized === 'low') return 'Low';
    return 'Medium';
  }
}
