import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  ReportStatus,
  UserRole,
  AssignmentStatus,
  Prisma,
} from '@prisma/client';
import {
  isValidStatusTransition,
  hasTransitionPermission,
  getNextValidStatuses,
  getAllowedTransitionsForRole,
  STATUS_PROGRESS_PERCENTAGE,
  SURVIVOR_STATUS_LABELS,
  SURVIVOR_STATUS_MESSAGES,
  SENSITIVE_REPORT_FIELDS,
} from '../constants/status-workflow.constants';

export interface StatusTransitionResult {
  success: boolean;
  previousStatus: ReportStatus;
  newStatus: ReportStatus;
  progressPercentage: number;
  caseAssignmentUpdated?: boolean;
  message?: string;
}

export interface StatusHistoryEntry {
  status: ReportStatus;
  timestamp: string;
  changedBy: string;
  changedByRole: UserRole;
  notes?: string;
}

@Injectable()
export class StatusWorkflowService {
  private readonly logger = new Logger(StatusWorkflowService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Validate and perform a status transition with full role checking.
   * This is the main entry point for status updates.
   */
  async transitionStatus(
    reportId: string,
    newStatus: ReportStatus,
    userId: string,
    userRole: UserRole,
    options?: {
      notes?: string;
      skipPermissionCheck?: boolean;
      skipCaseAssignmentSync?: boolean;
    },
  ): Promise<StatusTransitionResult> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: { caseAssignment: true },
    });

    if (!report) {
      throw new BadRequestException('Report not found');
    }

    const currentStatus = report.status;

    // Validate the transition is allowed in the workflow
    if (!isValidStatusTransition(currentStatus, newStatus)) {
      throw new BadRequestException(
        `Invalid status transition: Cannot move from ${currentStatus} to ${newStatus}. ` +
          `Allowed transitions: ${getNextValidStatuses(currentStatus).join(', ')}`,
      );
    }

    // Check role permissions (unless skipped for system operations)
    if (!options?.skipPermissionCheck) {
      if (!hasTransitionPermission(userRole, currentStatus, newStatus)) {
        throw new ForbiddenException(
          `Role ${userRole} does not have permission to transition from ${currentStatus} to ${newStatus}`,
        );
      }
    }

    // Build status history entry
    const historyEntry: StatusHistoryEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      changedBy: userId,
      changedByRole: userRole,
      notes: options?.notes,
    };

    // Parse existing history or create new array
    const existingHistory = ((report.statusHistory as unknown) as StatusHistoryEntry[]) || [];
    const updatedHistory = [...existingHistory, historyEntry];

    // Prepare update data
    const updateData: Prisma.ReportUpdateInput = {
      status: newStatus,
      statusHistory: updatedHistory as any,
    };

    // Set resolvedAt timestamp when reaching RESOLVED
    if (newStatus === ReportStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
    }

    // Set closedAt timestamp when reaching CLOSED
    if (newStatus === ReportStatus.CLOSED) {
      updateData.closedAt = new Date();
    }

    // Perform the update
    await this.prisma.report.update({
      where: { id: reportId },
      data: updateData,
    });

    // Synchronize CaseAssignment status if needed
    let caseAssignmentUpdated = false;
    if (!options?.skipCaseAssignmentSync) {
      caseAssignmentUpdated = await this.syncCaseAssignmentStatus(reportId, newStatus);
    }

    this.logger.log(
      `Status transition completed: ${reportId} ${currentStatus} -> ${newStatus} by ${userRole}(${userId})`,
    );

    return {
      success: true,
      previousStatus: currentStatus,
      newStatus,
      progressPercentage: STATUS_PROGRESS_PERCENTAGE[newStatus],
      caseAssignmentUpdated,
      message: `Status updated to ${newStatus}`,
    };
  }

  /**
   * Synchronize CaseAssignment status with Report status.
   * - When status becomes ASSIGNED → create/update CaseAssignment to ACTIVE
   * - When status becomes RESOLVED → update CaseAssignment to COMPLETED
   */
  private async syncCaseAssignmentStatus(
    reportId: string,
    reportStatus: ReportStatus,
  ): Promise<boolean> {
    try {
      const existingAssignment = await this.prisma.caseAssignment.findUnique({
        where: { reportId },
      });

      if (reportStatus === ReportStatus.ASSIGNED) {
        if (existingAssignment) {
          // Update existing to ACTIVE
          await this.prisma.caseAssignment.update({
            where: { reportId },
            data: { status: AssignmentStatus.ACTIVE },
          });
        }
        // Note: Creating new CaseAssignment should be handled by case-management.service
        return true;
      }

      if (reportStatus === ReportStatus.RESOLVED && existingAssignment) {
        await this.prisma.caseAssignment.update({
          where: { reportId },
          data: {
            status: AssignmentStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Failed to sync CaseAssignment for report ${reportId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Get the current progress percentage for a report.
   */
  async getProgressPercentage(reportId: string): Promise<number> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      select: { status: true },
    });

    if (!report) {
      throw new BadRequestException('Report not found');
    }

    return STATUS_PROGRESS_PERCENTAGE[report.status];
  }

  /**
   * Get survivor-friendly progress information.
   * This hides all sensitive/internal data.
   */
  async getSurvivorProgressView(reportId: string, userId?: string): Promise<{
    reportId: string;
    status: string;
    label: string;
    message: string;
    progressPercentage: number;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    category: string;
    canViewDetails: boolean;
  }> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        title: true,
        category: true,
        reporterId: true,
      },
    });

    if (!report) {
      throw new BadRequestException('Report not found');
    }

    // Check if user can view this report
    const canViewDetails = !userId || report.reporterId === userId;

    return {
      reportId: report.id,
      status: report.status,
      label: SURVIVOR_STATUS_LABELS[report.status],
      message: SURVIVOR_STATUS_MESSAGES[report.status],
      progressPercentage: STATUS_PROGRESS_PERCENTAGE[report.status],
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      title: report.title,
      category: report.category,
      canViewDetails,
    };
  }

  /**
   * Get the status history timeline for a report.
   */
  async getStatusTimeline(reportId: string): Promise<StatusHistoryEntry[]> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      select: { statusHistory: true },
    });

    if (!report) {
      throw new BadRequestException('Report not found');
    }

    return ((report.statusHistory as unknown) as StatusHistoryEntry[]) || [];
  }

  /**
   * Get allowed next statuses for a user based on their role.
   */
  getAllowedNextStatuses(
    currentStatus: ReportStatus,
    userRole: UserRole,
  ): ReportStatus[] {
    return getAllowedTransitionsForRole(userRole, currentStatus);
  }

  /**
   * Check if a user can perform a specific status transition.
   */
  canPerformTransition(
    userRole: UserRole,
    fromStatus: ReportStatus,
    toStatus: ReportStatus,
  ): boolean {
    return hasTransitionPermission(userRole, fromStatus, toStatus);
  }

  /**
   * Sanitize report data for survivor view by removing sensitive fields.
   */
  sanitizeForSurvivorView<T extends Record<string, any>>(report: T): Partial<T> {
    const sanitized = { ...report };
    for (const field of SENSITIVE_REPORT_FIELDS) {
      delete sanitized[field];
    }
    return sanitized;
  }

  /**
   * Batch update reports (admin only).
   */
  async batchTransitionStatus(
    reportIds: string[],
    newStatus: ReportStatus,
    adminId: string,
  ): Promise<{
    successful: string[];
    failed: Array<{ reportId: string; error: string }>;
  }> {
    const successful: string[] = [];
    const failed: Array<{ reportId: string; error: string }> = [];

    for (const reportId of reportIds) {
      try {
        await this.transitionStatus(
          reportId,
          newStatus,
          adminId,
          UserRole.ADMIN,
          { skipPermissionCheck: true },
        );
        successful.push(reportId);
      } catch (error) {
        failed.push({
          reportId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Initialize a new report with PENDING_REVIEW status.
   * This should be called when a report is created.
   */
  async initializeReport(reportId: string, reporterId?: string): Promise<void> {
    const historyEntry: StatusHistoryEntry = {
      status: ReportStatus.PENDING_REVIEW,
      timestamp: new Date().toISOString(),
      changedBy: reporterId || 'SYSTEM',
      changedByRole: reporterId ? UserRole.SURVIVOR : UserRole.SYSTEM,
      notes: 'Report submitted',
    };

    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.PENDING_REVIEW,
        statusHistory: [historyEntry] as any,
      },
    });
  }
}
