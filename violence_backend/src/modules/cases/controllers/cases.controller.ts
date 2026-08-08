import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CaseManagementService } from '../services/case-management.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AssignedCaseGuard } from '../../auth/guards/assigned-case.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateCaseAssignmentDto } from '../dto/create-case-assignment.dto';
import { AssignmentStatus, UserRole } from '@prisma/client';

@ApiTags('cases')
@Controller('cases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CasesController {
  constructor(private caseService: CaseManagementService) {}

  // IMPORTANT: Put specific static routes BEFORE parameterized routes
  // to avoid route matching conflicts

  @Get('invitations/me')
  @ApiOperation({
    summary: 'Get case invitations for the currently authenticated provider',
  })
  async getMyInvitations(@Request() req: any) {
    return this.caseService.getMyInvitations(
      req.user?.sub || req.user?.id,
      req.user?.role,
    );
  }

  @Get(':caseId')
  @UseGuards(AssignedCaseGuard)
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.SYSTEM, UserRole.MEDICAL_PROFESSIONAL, UserRole.LEGAL_ADVISOR)
  @ApiOperation({ summary: 'Get case assignment by ID' })
  async getCaseById(@Param('caseId') caseId: string, @Request() req: any) {
    return this.caseService.getCaseById(caseId, req.user?.sub || req.user?.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiOperation({ summary: 'Get all cases (admin and counselor)' })
  async getAllCases(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: AssignmentStatus,
  ) {
    return this.caseService.getAllCases(page, limit, status);
  }

  @Post('auto-route/:reportId')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get ML-based routing suggestions for a report (counselor/admin only)',
  })
  async autoRouteCase(@Param('reportId') reportId: string, @Request() req: any) {
    return this.caseService.autoRouteCase(reportId);
  }

  @Post('assign/:reportId')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Manually assign case to a professional' })
  async assignCase(
    @Param('reportId') reportId: string,
    @Body() dto: CreateCaseAssignmentDto,
    @Request() req: any,
  ) {
    return this.caseService.assignCase(
      reportId,
      dto,
      req.user?.sub || req.user?.id,
    );
  }

  @Post(':caseId/invitations/respond')
  @ApiOperation({
    summary:
      'Accept or decline a case invitation for the currently authenticated provider',
  })
  async respondToInvitation(
    @Param('caseId') caseId: string,
    @Body() body: { action: 'ACCEPT' | 'DECLINE' },
    @Request() req: any,
  ) {
    return this.caseService.respondToInvitation(
      caseId,
      req.user?.sub || req.user?.id,
      req.user?.role,
      body?.action,
    );
  }

  @Get('professional/:professionalId')
  @ApiOperation({
    summary: 'Get all cases assigned to a professional (own cases or admin/counselor)',
  })
  async getCasesForProfessional(
    @Param('professionalId') professionalId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('includePending') includePending?: string,
    @Request() req?: any,
  ) {
    const requesterId = req.user?.sub || req.user?.id;
    const requesterRole = req.user?.role;

    // Professionals can only query their own cases; counselors/admins can query any
    const privilegedRoles = ['COUNSELOR', 'ADMIN'];
    if (!privilegedRoles.includes(requesterRole) && requesterId !== professionalId) {
      throw new ForbiddenException('You can only access your own assigned cases');
    }

    return this.caseService.getCasesForProfessional(
      professionalId,
      page,
      limit,
      includePending === 'true',
    );
  }

  @Put(':caseId/status')
  @UseGuards(AssignedCaseGuard)
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.MEDICAL_PROFESSIONAL, UserRole.LEGAL_ADVISOR)
  @ApiOperation({ summary: 'Update case status (professionals and counselors only)' })
  async updateCaseStatus(
    @Param('caseId') caseId: string,
    @Body()
    body: { status: AssignmentStatus | 'IN_PROGRESS' | 'REJECTED'; feedback?: string },
    @Request() req: any,
  ) {
    return this.caseService.updateCaseStatus(
      caseId,
      body.status,
      body.feedback,
      req.user?.sub || req.user?.id,
    );
  }

  @Delete(':caseId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel case assignment (admin only)' })
  async cancelCase(@Request() req: any, @Param('caseId') caseId: string) {
    return this.caseService.cancelCase(caseId);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get case statistics (admin only)' })
  async getCaseStats(@Request() req: any) {
    return this.caseService.getCaseStats();
  }

  @Get('counselor/pending')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.SYSTEM)
  @ApiOperation({ summary: 'Get pending cases for counselor review (with ML classification)' })
  async getPendingCasesForReview(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: AssignmentStatus,
  ) {
    return this.caseService.getPendingCasesForReview(page, limit, status);
  }

  @Get('counselor/unassigned')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.SYSTEM)
  @ApiOperation({ summary: 'Get unassigned reports for counselor review and assignment' })
  async getUnassignedReportsForReview(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.caseService.getUnassignedReportsForReview(page, limit);
  }

  @Get('counselor/appointments')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.SYSTEM)
  @ApiOperation({ summary: 'Get counselor appointments (assigned cases as sessions)' })
  async getCounselorAppointments(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: AssignmentStatus,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.caseService.getCasesForProfessional(userId, page, limit, true);
  }

  @Put(':caseId/classification')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.SYSTEM)
  @ApiOperation({ summary: 'Confirm or override ML classification (counselor only)' })
  async updateClassification(
    @Param('caseId') caseId: string,
    @Body() body: {
      category?: string;
      severity?: string;
      caseType?: string;
      notes?: string;
    },
    @Request() req: any,
  ) {
    return this.caseService.updateCaseClassification(
      caseId,
      {
        ...body,
        caseType: body.caseType as any,
      },
      req.user?.sub || req.user?.id,
    );
  }

  // Case Comments endpoints for messaging
  @Get(':caseId/comments')
  @UseGuards(AssignedCaseGuard)
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.SYSTEM, UserRole.MEDICAL_PROFESSIONAL, UserRole.LEGAL_ADVISOR)
  @ApiOperation({ summary: 'Get all comments for a case' })
  async getCaseComments(
    @Param('caseId') caseId: string,
    @Request() req: any,
  ) {
    return this.caseService.getCaseComments(caseId, req.user?.sub || req.user?.id, req.user?.role);
  }

  @Post(':caseId/comments')
  @UseGuards(AssignedCaseGuard)
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.SYSTEM, UserRole.MEDICAL_PROFESSIONAL, UserRole.LEGAL_ADVISOR)
  @ApiOperation({ summary: 'Add a comment to a case' })
  async addCaseComment(
    @Param('caseId') caseId: string,
    @Body() body: { content: string; isInternal?: boolean },
    @Request() req: any,
  ) {
    return this.caseService.addCaseComment(
      caseId,
      req.user?.sub || req.user?.id,
      body.content,
      body.isInternal,
    );
  }

  @Delete('comments/:commentId')
  @Roles(UserRole.COUNSELOR, UserRole.ADMIN, UserRole.SYSTEM, UserRole.MEDICAL_PROFESSIONAL, UserRole.LEGAL_ADVISOR)
  @ApiOperation({ summary: 'Delete a case comment' })
  async deleteCaseComment(
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    return this.caseService.deleteCaseComment(
      commentId,
      req.user?.sub || req.user?.id,
      req.user?.role,
    );
  }
}
