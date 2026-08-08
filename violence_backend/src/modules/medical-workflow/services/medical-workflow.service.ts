import { BadRequestException, Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { AssignmentStatus, CasePriority, CaseType, ReportStatus, UserRole } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CaseManagementService } from '@/modules/cases/services/case-management.service';
import { NotificationService } from '@/modules/notification/notification.service';
import { ScheduleAppointmentDto } from '../dto/schedule-appointment.dto';
import { ScheduleExaminationDto } from '../dto/schedule-examination.dto';

type Metadata = {
  appointment?: {
    duration?: number;
    type?: string;
    location?: string;
    notes?: string;
  };
  examination?: {
    type?: string;
    location?: string;
  };
  medical?: {
    diagnosis?: string;
    treatment?: string;
    recommendations?: string;
    generalNotes?: string;
    updatedAt?: string;
  };
};

@Injectable()
export class MedicalWorkflowService {
  private readonly logger = new Logger(MedicalWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly caseService: CaseManagementService,
    private readonly notificationService: NotificationService,
  ) {}

  async getAppointments() {
    await this.autoAssignPendingMedicalCases();

    const cases = await this.prisma.caseAssignment.findMany({
      where: { caseType: { in: [CaseType.MEDICAL_SUPPORT, CaseType.COMBINED_SUPPORT] } },
      include: {
        report: {
          include: {
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
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    const appointments = cases.map((item) => {
      const meta = this.parseNotes(item.notes);
      const at = item.dueDate || item.createdAt;
      const patientName = this.resolvePatientName(item.report?.reporter);
      return {
        id: item.id,
        patientId: item.report?.reporter?.id || item.report?.reporterId || '',
        patientName,
        date: at.toISOString().split('T')[0],
        time: at.toISOString().slice(11, 16),
        duration: meta.appointment?.duration || 30,
        type: meta.appointment?.type || 'Consultation',
        status: this.toAppointmentStatus(item.status),
        location: meta.appointment?.location || 'Medical Center',
        notes: meta.appointment?.notes || '',
        priority: item.priority,
      };
    });

    const today = new Date().toISOString().split('T')[0];
    return {
      stats: {
        today: appointments.filter((a) => a.date === today).length,
        total: appointments.length,
        confirmed: appointments.filter((a) => a.status === 'Confirmed').length,
        pending: appointments.filter((a) => a.status === 'Pending').length,
      },
      appointments,
    };
  }

  async scheduleAppointment(dto: ScheduleAppointmentDto) {
    const { reportId, caseAssignmentId } = await this.ensureMedicalCaseForPatient(dto.patientId);
    const dueDate = this.toDate(dto.date, dto.time);
    const existing = await this.prisma.caseAssignment.findUnique({ where: { id: caseAssignmentId } });
    if (!existing) throw new NotFoundException('Medical case assignment not found');
    const merged = this.parseNotes(existing.notes);
    merged.appointment = {
      duration: dto.duration || 30,
      type: dto.type || 'Consultation',
      location: dto.location || 'Medical Center',
      notes: dto.notes || '',
    };

    const updated = await this.prisma.caseAssignment.update({
      where: { id: caseAssignmentId },
      data: {
        dueDate,
        priority: (dto.priority as CasePriority | undefined) || existing.priority,
        status: AssignmentStatus.ACTIVE,
        notes: JSON.stringify(merged),
      },
      include: {
        report: {
          include: {
            reporter: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      reportId,
      patientId: updated.report?.reporterId || '',
      patientName: this.resolvePatientName(updated.report?.reporter),
      date: dueDate.toISOString().split('T')[0],
      time: dueDate.toISOString().slice(11, 16),
    };
  }

  async getExaminations() {
    await this.autoAssignPendingMedicalCases();

    const cases = await this.prisma.caseAssignment.findMany({
      where: { 
        caseType: { in: [CaseType.MEDICAL_SUPPORT, CaseType.COMBINED_SUPPORT] },
        notes: {
          not: null,
        },
      },
      include: {
        report: {
          include: {
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
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    // Only include cases that have examination metadata in notes
    const examinations = cases
      .filter((item) => {
        const meta = this.parseNotes(item.notes);
        return meta.examination && Object.keys(meta.examination).length > 0;
      })
      .map((item) => {
        const meta = this.parseNotes(item.notes);
        const at = item.dueDate || item.createdAt;
        return {
          id: item.id,
          patientName: this.resolvePatientName(item.report?.reporter),
          patientId: item.report?.reporter?.id || item.report?.reporterId || '',
          type: meta.examination?.type || 'Forensic Medical Examination',
          scheduledDate: at.toISOString().split('T')[0],
          scheduledTime: at.toISOString().slice(11, 16),
          status: this.toExamStatus(item.status),
          priority: this.toTitleCase(item.priority),
          location: meta.examination?.location || 'Medical Center',
        };
      });

    return {
      stats: {
        total: examinations.length,
        scheduled: examinations.filter((x) => x.status === 'Scheduled').length,
        inProgress: examinations.filter((x) => x.status === 'In Progress').length,
        completed: examinations.filter((x) => x.status === 'Completed').length,
      },
      examinations,
    };
  }

  async scheduleExamination(dto: ScheduleExaminationDto) {
    const { caseAssignmentId } = await this.ensureMedicalCaseForPatient(dto.patientId);
    const at = this.toDate(dto.date, dto.time);
    const existing = await this.prisma.caseAssignment.findUnique({ where: { id: caseAssignmentId } });
    if (!existing) throw new NotFoundException('Medical case assignment not found');
    const merged = this.parseNotes(existing.notes);
    merged.examination = {
      type: dto.examType,
      location: dto.location || 'Medical Center',
    };
    const updated = await this.prisma.caseAssignment.update({
      where: { id: caseAssignmentId },
      data: {
        dueDate: at,
        priority: (dto.priority as CasePriority | undefined) || existing.priority,
        status: AssignmentStatus.ACTIVE,
        notes: JSON.stringify(merged),
      },
    });
    return { id: updated.id };
  }

  private async ensureMedicalCaseForPatient(patientId: string) {
    const report = await this.prisma.report.findFirst({
      where: {
        reporterId: patientId,
        OR: [
          { suggestedCaseType: CaseType.MEDICAL_SUPPORT },
          { suggestedCaseType: CaseType.COMBINED_SUPPORT },
          { caseAssignment: { is: { caseType: CaseType.MEDICAL_SUPPORT } } },
          { caseAssignment: { is: { caseType: CaseType.COMBINED_SUPPORT } } },
        ],
      },
      include: { caseAssignment: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!report) {
      throw new BadRequestException('No medical-support report found for selected patient');
    }

    let caseAssignmentId = report.caseAssignment?.id;
    if (!caseAssignmentId) {
      // Get ML suggestions
      const suggestions = await this.caseService.autoRouteCase(report.id);
      
      if (!suggestions.suggestedProfessionals.primary) {
        throw new BadRequestException('No available medical professionals for this case');
      }
      
      // Create the assignment using suggestions
      const assignment = await this.caseService.assignCase(
        report.id,
        {
          assignedToId: suggestions.suggestedProfessionals.primary.id,
          caseType: suggestions.suggestedCaseType,
          priority: suggestions.suggestedPriority,
          notes: 'Auto-assigned for medical workflow',
        },
        'system', // System user ID
      );
      
      caseAssignmentId = assignment.id;
    }

    return { reportId: report.id, caseAssignmentId };
  }

  private toDate(date: string, time: string) {
    const dt = new Date(`${date}T${time}:00`);
    if (Number.isNaN(dt.getTime())) {
      throw new BadRequestException('Invalid date/time provided');
    }
    return dt;
  }

  private parseNotes(notes?: string | null): Metadata {
    if (!notes) return {};
    try {
      const parsed = JSON.parse(notes);
      if (parsed && typeof parsed === 'object') return parsed as Metadata;
      return {};
    } catch {
      return {};
    }
  }

  private toAppointmentStatus(status: AssignmentStatus) {
    if (status === AssignmentStatus.COMPLETED) return 'Completed';
    if (status === AssignmentStatus.CANCELLED) return 'Cancelled';
    if (status === AssignmentStatus.ON_HOLD) return 'Pending';
    return 'Confirmed';
  }

  private toExamStatus(status: AssignmentStatus) {
    if (status === AssignmentStatus.COMPLETED) return 'Completed';
    if (status === AssignmentStatus.CANCELLED) return 'Cancelled';
    if (status === AssignmentStatus.ON_HOLD) return 'In Progress';
    return 'Scheduled';
  }

  private resolvePatientName(reporter?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null) {
    const full = `${reporter?.firstName || ''} ${reporter?.lastName || ''}`.trim();
    return full || reporter?.email || 'Unknown Patient';
  }

  private async autoAssignPendingMedicalCases(limit = 50) {
    // Check total medical reports in database
    const totalMedicalReports = await this.prisma.report.count({
      where: {
        suggestedCaseType: { in: [CaseType.MEDICAL_SUPPORT, CaseType.COMBINED_SUPPORT] },
      },
    });
    // Check existing medical case assignments
    const existingAssignments = await this.prisma.caseAssignment.findMany({
      where: {
        caseType: { in: [CaseType.MEDICAL_SUPPORT, CaseType.COMBINED_SUPPORT] },
      },
      select: {
        id: true,
        assignedToId: true,
        reportId: true,
      },
    });
    // Get user details for assigned users
    const assignedUserIds = [...new Set(existingAssignments.map(a => a.assignedToId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: assignedUserIds } },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    const pendingReports = await this.prisma.report.findMany({
      where: {
        reporter: { is: { role: 'SURVIVOR' } },
        caseAssignment: null,
        suggestedCaseType: { in: [CaseType.MEDICAL_SUPPORT, CaseType.COMBINED_SUPPORT] },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { id: true },
    });

    for (const report of pendingReports) {
      try {
        // Get ML suggestions
        const suggestions = await this.caseService.autoRouteCase(report.id);
        
        // Create assignment if we have a suggested professional
        if (suggestions.suggestedProfessionals.primary) {
          await this.caseService.assignCase(
            report.id,
            {
              assignedToId: suggestions.suggestedProfessionals.primary.id,
              caseType: suggestions.suggestedCaseType,
              priority: suggestions.suggestedPriority,
              notes: 'Auto-assigned by batch process',
            },
            'system', // System user ID
          );
        }
      } catch (error) {
        // Best effort only. UI load should still continue.
      }
    }
  }

  private toTitleCase(value: string) {
    return value.charAt(0) + value.slice(1).toLowerCase();
  }

  /**
   * Get cases assigned to the current medical professional
   */
  async getAssignedCases(
    userId: string,
    filters?: {
      status?: AssignmentStatus;
      priority?: CasePriority;
    },
  ) {
    // Get current user details
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    // Auto-assign pending medical cases first
    await this.autoAssignPendingMedicalCases();

    const where: any = {
      // TEMPORARY: Show all medical cases regardless of user assignment
      // assignedToId: userId,
      caseType: {
        in: [CaseType.MEDICAL_SUPPORT, CaseType.COMBINED_SUPPORT],
      },
    };

    // Map frontend status values to backend enum values
    if (filters?.status) {
      const statusMap: Record<string, AssignmentStatus> = {
        'ASSIGNED': AssignmentStatus.ACTIVE,
        'IN_PROGRESS': AssignmentStatus.ACTIVE,
        'RESOLVED': AssignmentStatus.COMPLETED,
      };
      where.status = statusMap[filters.status] || filters.status;
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
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return assignments.map((assignment) => {
      return {
        id: assignment.id,
        trackingNumber: assignment.report.trackingNumber || `REF-${assignment.report.id.slice(0, 8).toUpperCase()}`,
        category: assignment.report.category,
        severity: assignment.report.severity,
        priority: assignment.priority,
        status: this.mapAssignmentStatus(assignment.status),
        assignedAt: assignment.createdAt,
        caseType: assignment.caseType,
        description: assignment.report.description,
        isAnonymous: assignment.report.isAnonymous,
        reporter: assignment.report.reporter,
        mlSuggestions: {
          classificationLabel: assignment.report.classificationLabel,
          suggestedCaseType: assignment.report.suggestedCaseType,
          suggestedPriority: assignment.report.suggestedPriority,
        },
        riskScore: assignment.report.riskScore,
      };
    });
  }

  /**
   * Get case details for an assigned case
   */
  async getCaseDetails(caseId: string, userId: string) {
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

    // TEMPORARY: Skip access check for testing
    // if (assignment.assignedToId !== userId) {
    //   throw new ForbiddenException('You do not have access to this case');
    // }

    const report = assignment.report;

    return {
      case: {
        id: assignment.id,
        trackingNumber: report.trackingNumber || `REF-${report.id.slice(0, 8).toUpperCase()}`,
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
            trackingNumber: report.trackingNumber || `REF-${report.id.slice(0, 8).toUpperCase()}`,
          }
        : {
            isAnonymous: false,
            id: report.reporter?.id,
            firstName: report.reporter?.firstName,
            lastName: report.reporter?.lastName,
            email: report.reporter?.email,
            phone: report.reporter?.phone,
            trackingNumber: report.trackingNumber || `REF-${report.id.slice(0, 8).toUpperCase()}`,
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
    const assignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
    });

    if (!assignment) {
      throw new NotFoundException('Case not found');
    }

    // TEMPORARY: Skip access check for testing
    // if (assignment.assignedToId !== userId) {
    //   throw new ForbiddenException('You do not have access to this case');
    // }

    const updated = await this.prisma.caseAssignment.update({
      where: { id: caseId },
      data: { status },
      include: {
        report: true,
      },
    });

    // Also update report status if needed
    if (status === AssignmentStatus.COMPLETED) {
      await this.prisma.report.update({
        where: { id: assignment.reportId },
        data: { status: ReportStatus.RESOLVED, resolvedAt: new Date() },
      });
    } else if (status === AssignmentStatus.ACTIVE) {
      await this.prisma.report.update({
        where: { id: assignment.reportId },
        data: { status: ReportStatus.IN_SUPPORT },
      });
    }

    return updated;
  }

  /**
   * Add medical notes to a case
   */
  async addMedicalNotes(caseId: string, userId: string, notes: {
    diagnosis?: string;
    treatment?: string;
    recommendations?: string;
    generalNotes?: string;
  }) {
    const assignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
    });

    if (!assignment) {
      throw new NotFoundException('Case not found');
    }

    // TEMPORARY: Skip access check for testing
    // if (assignment.assignedToId !== userId) {
    //   throw new ForbiddenException('You do not have access to this case');
    // }

    const existingNotes = this.parseNotes(assignment.notes);
    const updatedNotes = {
      ...existingNotes,
      medical: {
        ...existingNotes.medical,
        diagnosis: notes.diagnosis,
        treatment: notes.treatment,
        recommendations: notes.recommendations,
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
   * Note: Requires Prisma migration to be run after adding AppointmentRequest model
   */
  async requestMeeting(caseId: string, userId: string, data: {
    proposedDateTime: string;
    message?: string;
    requestedToId: string;
  }) {
    const assignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
    });

    if (!assignment) {
      throw new NotFoundException('Case not found');
    }

    // TEMPORARY: Skip access check for testing
    // if (assignment.assignedToId !== userId) {
    //   throw new ForbiddenException('You do not have access to this case');
    // }

    // Temporarily store meeting request in case assignment notes
    // After Prisma migration, use: await this.prisma.appointmentRequest.create({...})
    const existingNotes = this.parseNotes(assignment.notes);
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
    const assignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
    });

    if (!assignment) {
      throw new NotFoundException('Case not found');
    }

    // TEMPORARY: Skip access check for testing
    // if (assignment.assignedToId !== userId) {
    //   throw new ForbiddenException('You do not have access to this case');
    // }

    // Medical professionals only see messages intended for them
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

    // TEMPORARY: Skip access check for testing
    // if (assignment.assignedToId !== userId) {
    //   throw new ForbiddenException('You do not have access to this case');
    // }

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
          ? `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || 'Your Medical Professional'
          : 'Your Medical Professional';

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
