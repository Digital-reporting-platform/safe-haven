import {
  Body,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PatientsService } from '../services/patients.service';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { AddPatientNoteDto } from '../dto/add-patient-note.dto';
import { AuthenticatedRequest } from '@/common/types/authenticated-request.type';

@ApiTags('patients')
@Controller('patients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post('assign-medical-needed')
  @ApiOperation({ summary: 'Auto-assign unassigned medical-support reports' })
  async assignMedicalNeeded(
    @Req() req: AuthenticatedRequest,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const role = req.user?.role;
    if (!role || !['MEDICAL_PROFESSIONAL', 'ADMIN', 'COUNSELOR'].includes(role)) {
      throw new ForbiddenException('You are not allowed to assign medical support');
    }

    return this.patientsService.autoAssignMedicalSupportReports(limit);
  }

  @Post('assign-care-needed')
  @ApiOperation({ summary: 'Auto-assign unassigned survivor reports into medical/legal care' })
  async assignCareNeeded(
    @Req() req: AuthenticatedRequest,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    const role = req.user?.role;
    if (!role || !['MEDICAL_PROFESSIONAL', 'LEGAL_ADVISOR', 'ADMIN', 'COUNSELOR'].includes(role)) {
      throw new ForbiddenException('You are not allowed to assign care workflow');
    }

    return this.patientsService.autoAssignCareReports(limit);
  }

  @Get('notifications/medical')
  @ApiOperation({ summary: 'Get role-based care notifications for bell icon' })
  async getMedicalNotifications(
    @Req() req: AuthenticatedRequest,
    @Query('hours', new DefaultValuePipe(48), ParseIntPipe) hours: number,
    @Query('limit', new DefaultValuePipe(40), ParseIntPipe) limit: number,
  ) {
    const role = req.user?.role;
    if (!role || !['MEDICAL_PROFESSIONAL', 'ADMIN', 'COUNSELOR', 'LEGAL_ADVISOR'].includes(role)) {
      throw new ForbiddenException('You are not allowed to view care notifications');
    }

    return this.patientsService.getMedicalNotifications(hours, limit, role);
  }

  @Get('notifications/role')
  @ApiOperation({ summary: 'Get role-based care notifications for bell icon' })
  async getRoleNotifications(
    @Req() req: AuthenticatedRequest,
    @Query('hours', new DefaultValuePipe(48), ParseIntPipe) hours: number,
    @Query('limit', new DefaultValuePipe(40), ParseIntPipe) limit: number,
  ) {
    const role = req.user?.role;
    if (!role || !['MEDICAL_PROFESSIONAL', 'ADMIN', 'COUNSELOR', 'LEGAL_ADVISOR'].includes(role)) {
      throw new ForbiddenException('You are not allowed to view care notifications');
    }

    return this.patientsService.getMedicalNotifications(hours, limit, role);
  }

  @Get('chat/conversations')
  @ApiOperation({ summary: 'Get medical chat conversations for current user' })
  async getChatConversations(@Req() req: AuthenticatedRequest) {
    const requesterId = req.user?.sub || req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId || !requesterRole) {
      throw new ForbiddenException('Unable to resolve authenticated user');
    }

    return this.patientsService.getChatConversations(requesterId, requesterRole);
  }

  @Get()
  @ApiOperation({ summary: 'Get patients for medical provider views' })
  async getPatients(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const role = req?.user?.role;
    if (!role || !['MEDICAL_PROFESSIONAL', 'ADMIN', 'COUNSELOR'].includes(role)) {
      throw new ForbiddenException('You are not allowed to list medical patients');
    }

    return this.patientsService.getPatients(search, status);
  }

  @Get(':patientId/record')
  @ApiOperation({ summary: 'Get detailed patient record' })
  async getPatientRecord(
    @Param('patientId') patientId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const requesterId = req.user?.sub || req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      throw new ForbiddenException('Unable to resolve authenticated user');
    }

    return this.patientsService.getPatientRecord(patientId, requesterId, requesterRole);
  }

  @Patch(':patientId')
  @ApiOperation({ summary: 'Update patient profile fields' })
  async updatePatient(
    @Param('patientId') patientId: string,
    @Body() dto: UpdatePatientDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const role = req.user?.role;
    if (!role || !['MEDICAL_PROFESSIONAL', 'ADMIN', 'COUNSELOR'].includes(role)) {
      throw new ForbiddenException('You are not allowed to update patient details');
    }

    return this.patientsService.updatePatient(patientId, dto);
  }

  @Post(':patientId/notes')
  @ApiOperation({ summary: 'Add provider note to latest patient report' })
  async addPatientNote(
    @Param('patientId') patientId: string,
    @Body() dto: AddPatientNoteDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const role = req.user?.role;
    const authorUserId = req.user?.sub || req.user?.id;

    if (!authorUserId) {
      throw new ForbiddenException('Unable to resolve authenticated user');
    }

    if (!role || !['MEDICAL_PROFESSIONAL', 'ADMIN', 'COUNSELOR'].includes(role)) {
      throw new ForbiddenException('You are not allowed to add patient notes');
    }

    return this.patientsService.addPatientNote(patientId, authorUserId, dto.content);
  }

  @Get(':patientId/chat')
  @ApiOperation({ summary: 'Get chat thread between patient and medical providers' })
  async getPatientChat(
    @Param('patientId') patientId: string,
    @Query('reportId') reportId: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const requesterId = req.user?.sub || req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId || !requesterRole) {
      throw new ForbiddenException('Unable to resolve authenticated user');
    }

    return this.patientsService.getPatientChat(
      patientId,
      requesterId,
      requesterRole,
      reportId,
    );
  }

  @Post(':patientId/chat')
  @ApiOperation({ summary: 'Send chat message in patient medical thread' })
  async sendPatientChat(
    @Param('patientId') patientId: string,
    @Body() dto: AddPatientNoteDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const requesterId = req.user?.sub || req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId || !requesterRole) {
      throw new ForbiddenException('Unable to resolve authenticated user');
    }

    return this.patientsService.sendPatientChatMessage(
      patientId,
      requesterId,
      requesterRole,
      dto.content,
      dto.reportId,
    );
  }
}
