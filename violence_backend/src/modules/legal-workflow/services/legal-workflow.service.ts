import { BadRequestException, Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  AssignmentStatus,
  CaseType,
  Prisma,
  ServiceProviderType,
  ReportStatus,
  UserRole,
} from '@prisma/client';
import { CaseManagementService } from '@/modules/cases/services/case-management.service';
import { NotificationService } from '@/modules/notification/notification.service';
import { UpdateLegalProfileDto } from '../dto/update-legal-profile.dto';

type LegalProviderContext = {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
  provider: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    specializations: string[];
    description: string | null;
  } | null;
};

type LegalExtraProfile = {
  barLicenseNumber?: string;
  bio?: string;
};

@Injectable()
export class LegalWorkflowService {
  private readonly logger = new Logger(LegalWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly caseManagementService: CaseManagementService,
    private readonly notificationService: NotificationService,
  ) {}

  private getLegalCaseFilter(providerId?: string): Prisma.CaseAssignmentWhereInput {
    const base: Prisma.CaseAssignmentWhereInput = {
      caseType: { in: [CaseType.LEGAL_ASSISTANCE, CaseType.COMBINED_SUPPORT] },
    };

    if (!providerId) return base;

    return {
      ...base,
      OR: [{ assignedToId: providerId }, { supportProviders: { some: { id: providerId } } }],
    };
  }

  private parseExtraProfile(description?: string | null): LegalExtraProfile {
    if (!description) return {};
    try {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === 'object') {
        return parsed as LegalExtraProfile;
      }
      return {};
    } catch {
      return { bio: description };
    }
  }

  private async getContext(userId: string): Promise<LegalProviderContext> {
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

    if (!user) throw new BadRequestException('Authenticated user not found');

    const provider = await this.prisma.serviceProvider.findFirst({
      where: {
        type: ServiceProviderType.LEGAL_ADVISOR,
        OR: [{ email: user.email }, { phone: user.phone || undefined }],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specializations: true,
        description: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return { user, provider };
  }

  private async getLegalAssignments(providerId?: string) {
    return this.prisma.caseAssignment.findMany({
      where: this.getLegalCaseFilter(providerId),
      include: {
        report: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            status: true,
            severity: true,
            createdAt: true,
            updatedAt: true,
            location: true,
            reporter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            evidences: {
              select: {
                id: true,
                fileName: true,
                fileType: true,
                fileUrl: true,
                createdAt: true,
              },
            },
            caseComments: {
              orderBy: { createdAt: 'desc' },
              take: 20,
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
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      take: 200,
    });
  }

  async getDashboard(userId: string) {
    await this.autoAssignPendingLegalCases();

    const context = await this.getContext(userId);
    const assignments = await this.getLegalAssignments(context.provider?.id);

    const active = assignments.filter((x) => x.status === AssignmentStatus.ACTIVE).length;
    const completed = assignments.filter((x) => x.status === AssignmentStatus.COMPLETED).length;
    const combined = assignments.filter((x) => x.caseType === CaseType.COMBINED_SUPPORT).length;
    const urgent = assignments.filter((x) => ['HIGH', 'CRITICAL'].includes(x.priority)).length;

    const upcomingEvents = assignments
      .filter((x) => !!x.dueDate)
      .slice(0, 8)
      .map((x) => ({
        id: x.id,
        title: `${x.report.title}`,
        date: x.dueDate?.toISOString(),
        type: 'deadline',
        patientId: x.report.reporter?.id || null,
      }));

    const recentCases = assignments.slice(0, 8).map((x) => ({
      id: x.id,
      reportId: x.reportId,
      title: x.report.title,
      caseType: x.caseType,
      priority: x.priority,
      status: x.status,
      patientName:
        `${x.report.reporter?.firstName || ''} ${x.report.reporter?.lastName || ''}`.trim() ||
        x.report.reporter?.email ||
        'Unknown survivor',
      updatedAt: x.updatedAt.toISOString(),
    }));

    return {
      stats: {
        activeCases: active,
        completedCases: completed,
        urgentCases: urgent,
        combinedCases: combined,
      },
      recentCases,
      upcomingEvents,
    };
  }

  async getCases(userId: string) {
    await this.autoAssignPendingLegalCases();

    const context = await this.getContext(userId);
    const assignments = await this.getLegalAssignments(context.provider?.id);

    return assignments.map((x) => ({
      id: x.id,
      reportId: x.reportId,
      trackingNumber: `REF-${x.report.id.slice(0, 8).toUpperCase()}`,
      title: x.report.title,
      description: x.report.description,
      category: x.report.category,
      caseType: x.caseType,
      priority: x.priority,
      status: x.status,
      assignedAt: x.createdAt.toISOString(),
      dueDate: x.dueDate?.toISOString() || null,
      createdAt: x.createdAt.toISOString(),
      updatedAt: x.updatedAt.toISOString(),
      patient: {
        id: x.report.reporter?.id || null,
        name:
          `${x.report.reporter?.firstName || ''} ${x.report.reporter?.lastName || ''}`.trim() ||
          x.report.reporter?.email ||
          'Unknown survivor',
      },
      evidenceCount: x.report.evidences.length,
    }));
  }

  async getConsultations(userId: string) {
    await this.autoAssignPendingLegalCases();

    const context = await this.getContext(userId);
    const assignments = await this.getLegalAssignments(context.provider?.id);

    return assignments
      .filter((x) => x.status === AssignmentStatus.ACTIVE)
      .slice(0, 20)
      .map((x) => ({
        id: x.id,
        caseId: x.reportId,
        topic: x.report.title,
        scheduledAt: (x.dueDate || x.updatedAt).toISOString(),
        mode: x.caseType === CaseType.COMBINED_SUPPORT ? 'In-Person' : 'Video',
        patientName:
          `${x.report.reporter?.firstName || ''} ${x.report.reporter?.lastName || ''}`.trim() ||
          x.report.reporter?.email ||
          'Unknown survivor',
      }));
  }

  async getCourtCalendar(userId: string) {
    await this.autoAssignPendingLegalCases();

    const context = await this.getContext(userId);
    const assignments = await this.getLegalAssignments(context.provider?.id);

    return assignments
      .filter((x) => !!x.dueDate)
      .map((x) => ({
        id: x.id,
        title: x.report.title,
        date: x.dueDate?.toISOString() || x.updatedAt.toISOString(),
        location: x.report.location || 'Court room not set',
        status: x.status,
        priority: x.priority,
      }));
  }

  async getDocuments(userId: string) {
    await this.autoAssignPendingLegalCases();

    const context = await this.getContext(userId);
    const assignments = await this.getLegalAssignments(context.provider?.id);

    return assignments.flatMap((x) =>
      x.report.evidences.map((ev) => ({
        id: ev.id,
        reportId: x.reportId,
        caseTitle: x.report.title,
        name: ev.fileName,
        fileType: ev.fileType,
        url: ev.fileUrl,
        uploadedAt: ev.createdAt.toISOString(),
      })),
    );
  }

  async getEvidence(userId: string) {
    return this.getDocuments(userId);
  }

  async getMessaging(userId: string) {
    await this.autoAssignPendingLegalCases();

    const context = await this.getContext(userId);
    const assignments = await this.getLegalAssignments(context.provider?.id);

    return assignments.map((x) => {
      const latest = x.report.caseComments[0];
      return {
        caseId: x.id,
        reportId: x.reportId,
        patientId: x.report.reporter?.id || null,
        patientName:
          `${x.report.reporter?.firstName || ''} ${x.report.reporter?.lastName || ''}`.trim() ||
          x.report.reporter?.email ||
          'Unknown survivor',
        lastMessage: latest?.content || 'No messages yet',
        lastMessageAt: (latest?.createdAt || x.updatedAt).toISOString(),
      };
    });
  }

  async getOutcomes(userId: string) {
    await this.autoAssignPendingLegalCases();

    const context = await this.getContext(userId);
    const assignments = await this.getLegalAssignments(context.provider?.id);

    const completed = assignments.filter((x) => x.status === AssignmentStatus.COMPLETED);
    const total = assignments.length;
    const successRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

    const resolvedDurations = completed
      .map((x) => x.completedAt && x.createdAt ? x.completedAt.getTime() - x.createdAt.getTime() : null)
      .filter((v): v is number => typeof v === 'number' && v > 0);

    const averageResolutionDays =
      resolvedDurations.length > 0
        ? Math.round(
            resolvedDurations.reduce((sum, current) => sum + current, 0) /
              resolvedDurations.length /
              (1000 * 60 * 60 * 24),
          )
        : 0;

    return {
      totalCases: total,
      completedCases: completed.length,
      successRate,
      averageResolutionDays,
      recentOutcomes: completed.slice(0, 10).map((x) => ({
        id: x.id,
        reportId: x.reportId,
        title: x.report.title,
        completedAt: x.completedAt?.toISOString() || x.updatedAt.toISOString(),
        priority: x.priority,
      })),
    };
  }

  async getResources(_userId: string) {
    return [
      {
        id: 'res-1',
        title: 'Protection Order Template Pack',
        category: 'Templates',
        type: 'PDF',
      },
      {
        id: 'res-2',
        title: 'Legal Workflow Checklist for Survivor Cases',
        category: 'Guidelines',
        type: 'DOC',
      },
      {
        id: 'res-3',
        title: 'Evidence Submission and Chain-of-Custody Guide',
        category: 'Evidence',
        type: 'PDF',
      },
    ];
  }

  async getProfile(userId: string) {
    const context = await this.getContext(userId);
    const extra = this.parseExtraProfile(context.provider?.description);

    return {
      firstName: context.user.firstName || '',
      lastName: context.user.lastName || '',
      email: context.user.email,
      phone: context.user.phone || '',
      firm: context.provider?.name || '',
      specialization: context.provider?.specializations?.[0] || '',
      barLicenseNumber: extra.barLicenseNumber || '',
      bio: extra.bio || '',
    };
  }

  async updateProfile(userId: string, dto: UpdateLegalProfileDto) {
    const context = await this.getContext(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
      select: { id: true },
    });

    const existingExtra = this.parseExtraProfile(context.provider?.description);
    const mergedExtra: LegalExtraProfile = {
      ...existingExtra,
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.barLicenseNumber !== undefined && { barLicenseNumber: dto.barLicenseNumber }),
    };

    const providerData = {
      name:
        dto.firm ||
        context.provider?.name ||
        `${dto.firstName ?? context.user.firstName ?? ''} ${dto.lastName ?? context.user.lastName ?? ''}`.trim() ||
        'Legal Advisor',
      type: ServiceProviderType.LEGAL_ADVISOR,
      email: context.user.email,
      phone: dto.phone ?? context.user.phone ?? null,
      description: JSON.stringify(mergedExtra),
      specializations:
        dto.specialization !== undefined
          ? dto.specialization
            ? [dto.specialization]
            : []
          : context.provider?.specializations || [],
      isVerified: true,
      languages: ['en'],
    };

    if (context.provider) {
      await this.prisma.serviceProvider.update({
        where: { id: context.provider.id },
        data: providerData,
      });
    } else {
      await this.prisma.serviceProvider.create({ data: providerData });
    }

    return this.getProfile(userId);
  }

  private async autoAssignPendingLegalCases(limit = 50) {
    const pendingReports = await this.prisma.report.findMany({
      where: {
        reporter: { is: { role: 'SURVIVOR' } },
        caseAssignment: null,
        suggestedCaseType: { in: [CaseType.LEGAL_ASSISTANCE, CaseType.COMBINED_SUPPORT] },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { id: true },
    });

    for (const report of pendingReports) {
      try {
        await this.caseManagementService.autoRouteCase(report.id);
      } catch {
        // best effort; keep response path healthy
      }
    }
  }

  /**
   * Get cases assigned to the current legal advisor
   */
  async getAssignedCases(
    userId: string,
    filters?: {
      status?: AssignmentStatus;
      priority?: string;
    },
  ) {
    const context = await this.getContext(userId);
    const providerId = context.provider?.id;

    const where: any = {
      caseType: {
        in: [CaseType.LEGAL_ASSISTANCE, CaseType.COMBINED_SUPPORT],
      },
      OR: [
        { assignedToId: providerId },
        { supportProviders: { some: { id: providerId } } }
      ]
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    const assignments = await this.prisma.caseAssignment.findMany({
      where,
      include: {
        report: {
          include: {
            evidences: true,
            caseComments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      trackingNumber: `REF-${assignment.report.id.slice(0, 8).toUpperCase()}`,
      category: assignment.report.category,
      severity: assignment.report.severity,
      priority: assignment.priority,
      status: this.mapAssignmentStatus(assignment.status),
      assignedAt: assignment.createdAt,
      caseType: assignment.caseType,
      description: assignment.report.description,
      isAnonymous: assignment.report.isAnonymous,
      mlSuggestions: {
        classificationLabel: assignment.report.classificationLabel,
        suggestedCaseType: assignment.report.suggestedCaseType,
        suggestedPriority: assignment.report.suggestedPriority,
      },
      riskScore: assignment.report.riskScore,
    }));
  }

  /**
   * Get case details for an assigned case
   */
  async getCaseDetails(caseId: string, userId: string) {
    const context = await this.getContext(userId);
    const providerId = context.provider?.id;

    const assignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
      include: {
        report: {
          include: {
            evidences: true,
            reporter: true,
            caseComments: {
              include: {
                author: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Case not found');
    }

    if (assignment.assignedToId !== providerId) {
      throw new ForbiddenException('You do not have access to this case');
    }

    const report = assignment.report;

    return {
      case: {
        id: assignment.id,
        trackingNumber: `REF-${report.id.slice(0, 8).toUpperCase()}`,
        category: report.category,
        severity: report.severity,
        description: report.description,
        priority: assignment.priority,
        status: this.mapAssignmentStatus(assignment.status),
        assignedAt: assignment.createdAt,
        caseType: assignment.caseType,
        notes: assignment.notes,
      },
      survivor: report.isAnonymous
        ? {
            isAnonymous: true,
            trackingNumber: `REF-${report.id.slice(0, 8).toUpperCase()}`,
          }
        : {
            isAnonymous: false,
            id: report.reporter?.id,
            firstName: report.reporter?.firstName,
            lastName: report.reporter?.lastName,
            email: report.reporter?.email,
            phone: report.reporter?.phone,
          },
      evidence: report.evidences.map((evidence) => ({
        id: evidence.id,
        fileName: evidence.fileName,
        fileType: evidence.fileType,
        fileSize: evidence.fileSize,
        fileUrl: evidence.fileUrl,
        description: evidence.description,
        uploadedAt: evidence.createdAt,
      })),
      mlSuggestions: {
        classificationLabel: report.classificationLabel,
        classificationScore: report.classificationScore,
        suggestedCaseType: report.suggestedCaseType,
        suggestedPriority: report.suggestedPriority,
      },
      riskScore: report.riskScore,
    };
  }

  /**
   * Update case status
   */
  async updateCaseStatus(caseId: string, userId: string, status: AssignmentStatus) {
    const context = await this.getContext(userId);
    const providerId = context.provider?.id;

    const assignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
    });

    if (!assignment) {
      throw new NotFoundException('Case not found');
    }

    if (assignment.assignedToId !== providerId) {
      throw new ForbiddenException('You do not have access to this case');
    }

    const updated = await this.prisma.caseAssignment.update({
      where: { id: caseId },
      data: { status },
      include: {
        report: true,
      },
    });

    if (status === AssignmentStatus.COMPLETED) {
      await this.prisma.report.update({
        where: { id: updated.report.id },
        data: { status: ReportStatus.RESOLVED, resolvedAt: new Date() },
      });
    } else if (status === AssignmentStatus.ACTIVE) {
      await this.prisma.report.update({
        where: { id: updated.report.id },
        data: { status: ReportStatus.IN_SUPPORT },
      });
    }

    return updated;
  }

  /**
   * Add legal notes to a case
   */
  async addLegalNotes(caseId: string, userId: string, notes: {
    legalAdvice?: string;
    suggestedSteps?: string;
    actionTaken?: string;
    generalNotes?: string;
  }) {
    const context = await this.getContext(userId);
    const providerId = context.provider?.id;

    const assignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
    });

    if (!assignment) {
      throw new NotFoundException('Case not found');
    }

    if (assignment.assignedToId !== providerId) {
      throw new ForbiddenException('You do not have access to this case');
    }

    const existingNotes = this.parseExtraProfile(assignment.notes);
    const updatedNotes = {
      ...existingNotes,
      legal: {
        ...existingNotes,
        legalAdvice: notes.legalAdvice,
        suggestedSteps: notes.suggestedSteps,
        actionTaken: notes.actionTaken,
        generalNotes: notes.generalNotes,
        updatedAt: new Date().toISOString(),
      },
    };

    const updated = await this.prisma.caseAssignment.update({
      where: { id: caseId },
      data: { notes: JSON.stringify(updatedNotes) },
    });

    return updated;
  }

  /**
   * Request a meeting/appointment
   */
  async requestMeeting(caseId: string, userId: string, data: {
    proposedDateTime: string;
    message?: string;
    requestedToId: string;
  }) {
    const context = await this.getContext(userId);
    const providerId = context.provider?.id;

    const assignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
    });

    if (!assignment) {
      throw new NotFoundException('Case not found');
    }

    if (assignment.assignedToId !== providerId) {
      throw new ForbiddenException('You do not have access to this case');
    }

    const existingNotes = this.parseExtraProfile(assignment.notes);
    const updatedNotes = {
      ...existingNotes,
      meetingRequest: {
        proposedDateTime: data.proposedDateTime,
        message: data.message,
        requestedToId: data.requestedToId,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
    };

    const updated = await this.prisma.caseAssignment.update({
      where: { id: caseId },
      data: { notes: JSON.stringify(updatedNotes) },
    });

    return updated;
  }

  /**
   * Get case comments for messaging
   * Filters by audience so professionals only see messages intended for them
   */
  async getCaseComments(caseId: string, userId: string) {
    const context = await this.getContext(userId);
    const providerId = context.provider?.id;

    const assignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
    });

    if (!assignment) {
      throw new NotFoundException('Case not found');
    }

    if (assignment.assignedToId !== providerId) {
      throw new ForbiddenException('You do not have access to this case');
    }

    // Legal advisors only see messages intended for them
    const comments = await this.prisma.caseComment.findMany({
      where: {
        reportId: assignment.reportId,
        OR: [
          { audience: 'ALL' },
          { audience: 'ASSIGNED_PROFESSIONAL' },
        ],
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
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      senderRole: comment.senderRole,
      isSystemMessage: comment.isSystemMessage,
      isPublic: comment.isPublic,
      createdAt: comment.createdAt,
      author: comment.author ? {
        id: comment.author.id,
        name: `${comment.author.firstName} ${comment.author.lastName}`.trim(),
        role: comment.author.role,
      } : null,
    }));
  }

  /**
   * Add a comment to a case
   */
  async addCaseComment(caseId: string, userId: string, content: string, senderRole: UserRole) {
    const context = await this.getContext(userId);
    const providerId = context.provider?.id;

    const assignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
      include: {
        report: {
          select: {
            id: true,
            reporterId: true,
            contactEmail: true,
            isAnonymous: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Case not found');
    }

    if (assignment.assignedToId !== providerId) {
      throw new ForbiddenException('You do not have access to this case');
    }

    const comment = await this.prisma.caseComment.create({
      data: {
        reportId: assignment.reportId,
        authorId: userId,
        content,
        senderRole,
        isPublic: true,
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

    // Send notification to survivor if they have a contact email
    if (assignment.report.contactEmail) {
      try {
        const senderName = comment.author
          ? `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || 'Your Legal Advisor'
          : 'Your Legal Advisor';

        await this.notificationService.sendNewMessageNotification(
          assignment.report.contactEmail,
          assignment.report.id,
          senderName,
          senderRole,
          content,
        );
        this.logger.log(`New message notification sent to ${assignment.report.contactEmail} for report ${assignment.report.id}`);
      } catch (error) {
        this.logger.error(`Failed to send new message notification: ${(error as Error).message}`);
        // Don't throw - message was created successfully, notification is secondary
      }
    }

    return comment;
  }

  private mapAssignmentStatus(status: AssignmentStatus): string {
    const statusMap: Record<AssignmentStatus, string> = {
      [AssignmentStatus.ACTIVE]: 'IN_PROGRESS',
      [AssignmentStatus.ON_HOLD]: 'IN_PROGRESS',
      [AssignmentStatus.COMPLETED]: 'RESOLVED',
      [AssignmentStatus.CANCELLED]: 'CANCELLED',
    };
    return statusMap[status] || status;
  }
}
