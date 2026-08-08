import { Body, Controller, ForbiddenException, Get, Post, Put, Req, UseGuards, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/common/types/authenticated-request.type';
import { MedicalWorkflowService } from '../services/medical-workflow.service';
import { ScheduleAppointmentDto } from '../dto/schedule-appointment.dto';
import { ScheduleExaminationDto } from '../dto/schedule-examination.dto';
import { AssignmentStatus } from '@prisma/client';

@ApiTags('medical-workflow')
@Controller('medical-provider')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MedicalWorkflowController {
  constructor(private readonly service: MedicalWorkflowService) {}

  private ensureMedicalRole(role?: string) {
    if (!role || !['MEDICAL_PROFESSIONAL', 'ADMIN'].includes(role)) {
      throw new ForbiddenException('Medical provider access required');
    }
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Get medical appointments and stats' })
  async getAppointments(@Req() req: AuthenticatedRequest) {
    this.ensureMedicalRole(req.user?.role);
    return this.service.getAppointments();
  }

  @Post('appointments')
  @ApiOperation({ summary: 'Schedule medical appointment for patient' })
  async scheduleAppointment(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ScheduleAppointmentDto,
  ) {
    this.ensureMedicalRole(req.user?.role);
    return this.service.scheduleAppointment(dto);
  }

  @Get('examinations')
  @ApiOperation({ summary: 'Get medical examinations and stats' })
  async getExaminations(@Req() req: AuthenticatedRequest) {
    this.ensureMedicalRole(req.user?.role);
    return this.service.getExaminations();
  }

  @Post('examinations')
  @ApiOperation({ summary: 'Schedule medical examination for patient' })
  async scheduleExamination(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ScheduleExaminationDto,
  ) {
    this.ensureMedicalRole(req.user?.role);
    return this.service.scheduleExamination(dto);
  }

  @Get('cases')
  @ApiOperation({ summary: 'Get cases assigned to medical professional' })
  async getAssignedCases(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: AssignmentStatus,
    @Query('priority') priority?: string,
  ) {
    this.ensureMedicalRole(req.user?.role);
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new ForbiddenException('User ID required');
    return this.service.getAssignedCases(userId, {
      status,
      priority: priority as any,
    });
  }

  @Get('cases/:id')
  @ApiOperation({ summary: 'Get case details for assigned case' })
  async getCaseDetails(
    @Req() req: AuthenticatedRequest,
    @Param('id') caseId: string,
  ) {
    this.ensureMedicalRole(req.user?.role);
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new ForbiddenException('User ID required');
    return this.service.getCaseDetails(caseId, userId);
  }

  @Put('cases/:id/status')
  @ApiOperation({ summary: 'Update case status' })
  async updateCaseStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') caseId: string,
    @Body() body: { status: AssignmentStatus },
  ) {
    this.ensureMedicalRole(req.user?.role);
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new ForbiddenException('User ID required');
    return this.service.updateCaseStatus(caseId, userId, body.status);
  }

  @Post('cases/:id/notes')
  @ApiOperation({ summary: 'Add medical notes to case' })
  async addMedicalNotes(
    @Req() req: AuthenticatedRequest,
    @Param('id') caseId: string,
    @Body() body: {
      diagnosis?: string;
      treatment?: string;
      recommendations?: string;
      generalNotes?: string;
    },
  ) {
    this.ensureMedicalRole(req.user?.role);
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new ForbiddenException('User ID required');
    return this.service.addMedicalNotes(caseId, userId, body);
  }

  @Post('cases/:id/meeting-request')
  @ApiOperation({ summary: 'Request a meeting for a case' })
  async requestMeeting(
    @Req() req: AuthenticatedRequest,
    @Param('id') caseId: string,
    @Body() body: {
      proposedDateTime: string;
      message?: string;
      requestedToId: string;
    },
  ) {
    this.ensureMedicalRole(req.user?.role);
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new ForbiddenException('User ID required');
    return this.service.requestMeeting(caseId, userId, body);
  }

  @Get('cases/:id/comments')
  @ApiOperation({ summary: 'Get case comments for messaging' })
  async getCaseComments(
    @Req() req: AuthenticatedRequest,
    @Param('id') caseId: string,
  ) {
    this.ensureMedicalRole(req.user?.role);
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new ForbiddenException('User ID required');
    return this.service.getCaseComments(caseId, userId);
  }

  @Post('cases/:id/comments')
  @ApiOperation({ summary: 'Add a comment to a case' })
  async addCaseComment(
    @Req() req: AuthenticatedRequest,
    @Param('id') caseId: string,
    @Body() body: { content: string },
  ) {
    this.ensureMedicalRole(req.user?.role);
    const userId = req.user?.sub || req.user?.id;
    if (!userId) throw new ForbiddenException('User ID required');
    return this.service.addCaseComment(caseId, userId, body.content, req.user?.role as any);
  }
}

