import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Put,
  Post,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/common/types/authenticated-request.type';
import { LegalWorkflowService } from '../services/legal-workflow.service';
import { UpdateLegalProfileDto } from '../dto/update-legal-profile.dto';
import { AssignmentStatus } from '@prisma/client';

@ApiTags('legal-workflow')
@Controller('legal-provider')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class LegalWorkflowController {
  constructor(private readonly legalWorkflowService: LegalWorkflowService) {}

  private getUserIdOrThrow(req: AuthenticatedRequest) {
    const userId = req.user?.sub || req.user?.id;
    const role = req.user?.role;
    if (!userId) throw new ForbiddenException('Unable to resolve authenticated user');
    if (!role || !['LEGAL_ADVISOR', 'ADMIN'].includes(role)) {
      throw new ForbiddenException('Legal provider access required');
    }
    return userId;
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get legal dashboard data' })
  async getDashboard(@Req() req: AuthenticatedRequest) {
    return this.legalWorkflowService.getDashboard(this.getUserIdOrThrow(req));
  }

  @Get('cases')
  @ApiOperation({ summary: 'Get legal cases assigned to current legal provider' })
  async getCases(@Req() req: AuthenticatedRequest) {
    return this.legalWorkflowService.getCases(this.getUserIdOrThrow(req));
  }

  @Get('consultations')
  @ApiOperation({ summary: 'Get legal consultations for current provider' })
  async getConsultations(@Req() req: AuthenticatedRequest) {
    return this.legalWorkflowService.getConsultations(this.getUserIdOrThrow(req));
  }

  @Get('court-calendar')
  @ApiOperation({ summary: 'Get legal court calendar events' })
  async getCourtCalendar(@Req() req: AuthenticatedRequest) {
    return this.legalWorkflowService.getCourtCalendar(this.getUserIdOrThrow(req));
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get legal documents linked to assigned legal cases' })
  async getDocuments(@Req() req: AuthenticatedRequest) {
    return this.legalWorkflowService.getDocuments(this.getUserIdOrThrow(req));
  }

  @Get('evidence')
  @ApiOperation({ summary: 'Get legal evidence linked to assigned legal cases' })
  async getEvidence(@Req() req: AuthenticatedRequest) {
    return this.legalWorkflowService.getEvidence(this.getUserIdOrThrow(req));
  }

  @Get('messaging')
  @ApiOperation({ summary: 'Get legal messaging overview' })
  async getMessaging(@Req() req: AuthenticatedRequest) {
    return this.legalWorkflowService.getMessaging(this.getUserIdOrThrow(req));
  }

  @Get('outcomes')
  @ApiOperation({ summary: 'Get legal outcomes and performance summary' })
  async getOutcomes(@Req() req: AuthenticatedRequest) {
    return this.legalWorkflowService.getOutcomes(this.getUserIdOrThrow(req));
  }

  @Get('resources')
  @ApiOperation({ summary: 'Get legal resource recommendations' })
  async getResources(@Req() req: AuthenticatedRequest) {
    return this.legalWorkflowService.getResources(this.getUserIdOrThrow(req));
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get legal provider profile' })
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.legalWorkflowService.getProfile(this.getUserIdOrThrow(req));
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update legal provider profile' })
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateLegalProfileDto,
  ) {
    return this.legalWorkflowService.updateProfile(this.getUserIdOrThrow(req), dto);
  }

  @Get('cases/:id')
  @ApiOperation({ summary: 'Get case details for assigned case' })
  async getCaseDetails(
    @Req() req: AuthenticatedRequest,
    @Param('id') caseId: string,
  ) {
    const userId = this.getUserIdOrThrow(req);
    return this.legalWorkflowService.getCaseDetails(caseId, userId);
  }

  @Put('cases/:id/status')
  @ApiOperation({ summary: 'Update case status' })
  async updateCaseStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') caseId: string,
    @Body() body: { status: AssignmentStatus },
  ) {
    const userId = this.getUserIdOrThrow(req);
    return this.legalWorkflowService.updateCaseStatus(caseId, userId, body.status);
  }

  @Post('cases/:id/notes')
  @ApiOperation({ summary: 'Add legal notes to case' })
  async addLegalNotes(
    @Req() req: AuthenticatedRequest,
    @Param('id') caseId: string,
    @Body() body: {
      legalAdvice?: string;
      suggestedSteps?: string;
      actionTaken?: string;
      generalNotes?: string;
    },
  ) {
    const userId = this.getUserIdOrThrow(req);
    return this.legalWorkflowService.addLegalNotes(caseId, userId, body);
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
    const userId = this.getUserIdOrThrow(req);
    return this.legalWorkflowService.requestMeeting(caseId, userId, body);
  }

  @Get('cases/:id/comments')
  @ApiOperation({ summary: 'Get case comments for messaging' })
  async getCaseComments(
    @Req() req: AuthenticatedRequest,
    @Param('id') caseId: string,
  ) {
    const userId = this.getUserIdOrThrow(req);
    return this.legalWorkflowService.getCaseComments(caseId, userId);
  }

  @Post('cases/:id/comments')
  @ApiOperation({ summary: 'Add a comment to a case' })
  async addCaseComment(
    @Req() req: AuthenticatedRequest,
    @Param('id') caseId: string,
    @Body() body: { content: string },
  ) {
    const userId = this.getUserIdOrThrow(req);
    return this.legalWorkflowService.addCaseComment(caseId, userId, body.content, req.user?.role as any);
  }
}
