import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { StatusWorkflowService } from '../services/status-workflow.service';
import {
  UpdateStatusDto,
  StatusTransitionResponseDto,
  ProgressViewDto,
  TimelineResponseDto,
  AllowedTransitionsDto,
  BatchUpdateStatusDto,
} from '../dto/update-status.dto';
import { UserRole, ReportStatus } from '@prisma/client';
import {
  STATUS_TRANSITION_PERMISSIONS,
  getAllowedTransitionsForRole,
} from '../constants/status-workflow.constants';

@ApiTags('progress')
@Controller('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private statusWorkflowService: StatusWorkflowService) {}

  /**
   * Get survivor-friendly progress view for a report.
   * Returns simplified status labels and messages without sensitive data.
   */
  @Get('survivor/:reportId')
  @ApiOperation({
    summary: 'Get survivor-friendly progress view',
    description: 'Returns simplified status labels and messages for survivors',
  })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  async getSurvivorProgress(
    @Param('reportId') reportId: string,
    @Req() req: any,
  ): Promise<ProgressViewDto> {
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.role as UserRole;

    // Check if user has permission to view this report
    const progress = await this.statusWorkflowService.getSurvivorProgressView(
      reportId,
      userId,
    );

    // Survivors can only view their own reports
    if (userRole === UserRole.SURVIVOR && !progress.canViewDetails) {
      throw new ForbiddenException('You can only view your own reports');
    }

    // Moderators have no access to report progress
    if (userRole === UserRole.MODERATOR) {
      throw new ForbiddenException('Moderators cannot view report progress');
    }

    return progress;
  }

  /**
   * Get status timeline/history for a report.
   * Available to admin, counselors, and professionals.
   */
  @Get('timeline/:reportId')
  @ApiOperation({
    summary: 'Get status timeline for a report',
    description: 'Returns the history of all status changes',
  })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  async getStatusTimeline(
    @Param('reportId') reportId: string,
    @Req() req: any,
  ): Promise<TimelineResponseDto> {
    const userRole = req.user?.role as UserRole;

    // Only admin, counselors, and professionals can view timeline
    const allowedRoles = [
      UserRole.ADMIN,
      UserRole.COUNSELOR,
      UserRole.MEDICAL_PROFESSIONAL,
      UserRole.LEGAL_ADVISOR,
      UserRole.SYSTEM,
    ];

    if (!allowedRoles.some((r) => r === userRole)) {
      throw new ForbiddenException(
        'You do not have permission to view status timeline',
      );
    }

    const timeline =
      await this.statusWorkflowService.getStatusTimeline(reportId);

    return {
      reportId,
      timeline,
    };
  }

  /**
   * Update report status with role-based validation.
   */
  @Post(':reportId/status')
  @ApiOperation({
    summary: 'Update report status',
    description: 'Updates report status with role-based permission checks',
  })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  async updateStatus(
    @Param('reportId') reportId: string,
    @Body() dto: UpdateStatusDto,
    @Req() req: any,
  ): Promise<StatusTransitionResponseDto> {
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.role as UserRole;

    // Moderators cannot update report status
    if (userRole === UserRole.MODERATOR) {
      throw new ForbiddenException('Moderators cannot update report status');
    }

    // Survivors cannot update status (they create reports as PENDING_REVIEW)
    if (userRole === UserRole.SURVIVOR) {
      throw new ForbiddenException(
        'Survivors cannot update report status. Your report will be processed by our team.',
      );
    }

    return this.statusWorkflowService.transitionStatus(
      reportId,
      dto.status,
      userId,
      userRole,
      { notes: dto.notes },
    );
  }

  /**
   * Get allowed next statuses for the current user on a specific report.
   */
  @Get(':reportId/allowed-transitions')
  @ApiOperation({
    summary: 'Get allowed status transitions',
    description:
      'Returns the statuses the current user can transition the report to',
  })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  async getAllowedTransitions(
    @Param('reportId') reportId: string,
    @Req() req: any,
  ): Promise<AllowedTransitionsDto> {
    const userRole = req.user?.role as UserRole;

    // Get current report status
    const report = await this.statusWorkflowService['prisma'].report.findUnique({
      where: { id: reportId },
      select: { status: true },
    });

    if (!report) {
      throw new BadRequestException('Report not found');
    }

    const allowedTransitions = getAllowedTransitionsForRole(
      userRole,
      report.status,
    );

    return {
      currentStatus: report.status,
      allowedTransitions,
    };
  }

  /**
   * Batch update report statuses (admin only).
   */
  @Post('batch/status')
  @ApiOperation({
    summary: 'Batch update report statuses',
    description: 'Update multiple reports to the same status (admin only)',
  })
  async batchUpdateStatus(
    @Body() dto: BatchUpdateStatusDto,
    @Req() req: any,
  ): Promise<{
    successful: string[];
    failed: Array<{ reportId: string; error: string }>;
  }> {
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.role as UserRole;

    // Only admin can batch update
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SYSTEM) {
      throw new ForbiddenException('Admin access required for batch updates');
    }

    return this.statusWorkflowService.batchTransitionStatus(
      dto.reportIds,
      dto.status,
      userId,
    );
  }

  /**
   * Get progress percentage for a report.
   */
  @Get(':reportId/percentage')
  @ApiOperation({
    summary: 'Get progress percentage',
    description: 'Returns the completion percentage (0-100) for a report',
  })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  async getProgressPercentage(
    @Param('reportId') reportId: string,
    @Req() req: any,
  ): Promise<{ reportId: string; percentage: number }> {
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.role as UserRole;

    // Check report ownership for survivors
    if (userRole === UserRole.SURVIVOR) {
      const report =
        await this.statusWorkflowService['prisma'].report.findUnique({
          where: { id: reportId },
          select: { reporterId: true },
        });

      if (!report) {
        throw new BadRequestException('Report not found');
      }

      if (report.reporterId !== userId) {
        throw new ForbiddenException('You can only view your own reports');
      }
    }

    const percentage =
      await this.statusWorkflowService.getProgressPercentage(reportId);

    return { reportId, percentage };
  }

  /**
   * Transition report to RECEIVED (counselor/admin only).
   */
  @Post(':reportId/receive')
  @ApiOperation({
    summary: 'Mark report as received',
    description: 'Transition report from PENDING_REVIEW to RECEIVED',
  })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  async receiveReport(
    @Param('reportId') reportId: string,
    @Body() body: { notes?: string },
    @Req() req: any,
  ): Promise<StatusTransitionResponseDto> {
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.role as UserRole;

    const allowedRoles = [UserRole.ADMIN, UserRole.COUNSELOR, UserRole.SYSTEM];
    if (!allowedRoles.some((r) => r === userRole)) {
      throw new ForbiddenException('Admin or counselor access required');
    }

    return this.statusWorkflowService.transitionStatus(
      reportId,
      ReportStatus.RECEIVED,
      userId,
      userRole,
      { notes: body.notes || 'Report received and under review' },
    );
  }

  /**
   * Transition report to ASSIGNED (counselor/admin only).
   */
  @Post(':reportId/assign')
  @ApiOperation({
    summary: 'Mark report as assigned',
    description: 'Transition report from RECEIVED to ASSIGNED',
  })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  async assignReport(
    @Param('reportId') reportId: string,
    @Body() body: { notes?: string },
    @Req() req: any,
  ): Promise<StatusTransitionResponseDto> {
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.role as UserRole;

    const allowedRoles = [UserRole.ADMIN, UserRole.COUNSELOR, UserRole.SYSTEM];
    if (!allowedRoles.some((r) => r === userRole)) {
      throw new ForbiddenException('Admin or counselor access required');
    }

    return this.statusWorkflowService.transitionStatus(
      reportId,
      ReportStatus.ASSIGNED,
      userId,
      userRole,
      { notes: body.notes || 'Case assigned to professional' },
    );
  }

  /**
   * Transition report to IN_SUPPORT (medical/legal professionals).
   */
  @Post(':reportId/start-support')
  @ApiOperation({
    summary: 'Start providing support',
    description:
      'Transition report from ASSIGNED to IN_SUPPORT (professionals only)',
  })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  async startSupport(
    @Param('reportId') reportId: string,
    @Body() body: { notes?: string },
    @Req() req: any,
  ): Promise<StatusTransitionResponseDto> {
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.role as UserRole;

    const allowedRoles = [
      UserRole.MEDICAL_PROFESSIONAL,
      UserRole.LEGAL_ADVISOR,
      UserRole.ADMIN,
      UserRole.SYSTEM,
    ];
    if (!allowedRoles.some((r) => r === userRole)) {
      throw new ForbiddenException(
        'Medical or legal professional access required',
      );
    }

    return this.statusWorkflowService.transitionStatus(
      reportId,
      ReportStatus.IN_SUPPORT,
      userId,
      userRole,
      { notes: body.notes || 'Support services started' },
    );
  }

  /**
   * Transition report to RESOLVED (medical/legal professionals).
   */
  @Post(':reportId/resolve')
  @ApiOperation({
    summary: 'Mark report as resolved',
    description:
      'Transition report from IN_SUPPORT to RESOLVED (professionals only)',
  })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  async resolveReport(
    @Param('reportId') reportId: string,
    @Body() body: { notes?: string; feedback?: string },
    @Req() req: any,
  ): Promise<StatusTransitionResponseDto> {
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.role as UserRole;

    const allowedRoles = [
      UserRole.MEDICAL_PROFESSIONAL,
      UserRole.LEGAL_ADVISOR,
      UserRole.ADMIN,
      UserRole.SYSTEM,
    ];
    if (!allowedRoles.some((r) => r === userRole)) {
      throw new ForbiddenException(
        'Medical or legal professional access required',
      );
    }

    const notes = [body.notes, body.feedback]
      .filter(Boolean)
      .join('. ');

    return this.statusWorkflowService.transitionStatus(
      reportId,
      ReportStatus.RESOLVED,
      userId,
      userRole,
      { notes: notes || 'Case resolved' },
    );
  }

  /**
   * Transition report to CLOSED (admin/counselor only).
   */
  @Post(':reportId/close')
  @ApiOperation({
    summary: 'Close report',
    description:
      'Transition report from RESOLVED to CLOSED (admin/counselor only)',
  })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  async closeReport(
    @Param('reportId') reportId: string,
    @Body() body: { notes?: string },
    @Req() req: any,
  ): Promise<StatusTransitionResponseDto> {
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.role as UserRole;

    const allowedRoles = [UserRole.ADMIN, UserRole.COUNSELOR, UserRole.SYSTEM];
    if (!allowedRoles.some((r) => r === userRole)) {
      throw new ForbiddenException('Admin or counselor access required');
    }

    return this.statusWorkflowService.transitionStatus(
      reportId,
      ReportStatus.CLOSED,
      userId,
      userRole,
      { notes: body.notes || 'Case officially closed' },
    );
  }

  /**
   * Reject a report (admin/counselor only).
   */
  @Post(':reportId/reject')
  @ApiOperation({
    summary: 'Reject report',
    description:
      'Reject a report from PENDING_REVIEW (admin/counselor only)',
  })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  async rejectReport(
    @Param('reportId') reportId: string,
    @Body() body: { reason: string },
    @Req() req: any,
  ): Promise<StatusTransitionResponseDto> {
    const userId = req.user?.sub || req.user?.id;
    const userRole = req.user?.role as UserRole;

    const allowedRoles = [UserRole.ADMIN, UserRole.COUNSELOR, UserRole.SYSTEM];
    if (!allowedRoles.some((r) => r === userRole)) {
      throw new ForbiddenException('Admin or counselor access required');
    }

    if (!body.reason) {
      throw new BadRequestException('Rejection reason is required');
    }

    return this.statusWorkflowService.transitionStatus(
      reportId,
      ReportStatus.REJECTED,
      userId,
      userRole,
      { notes: `Rejected: ${body.reason}` },
    );
  }
}
