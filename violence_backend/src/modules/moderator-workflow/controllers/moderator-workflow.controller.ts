import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/common/types/authenticated-request.type';
import { ModeratorWorkflowService } from '../services/moderator-workflow.service';
import { ModerateContentDto } from '../dto/moderate-content.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UpdateModeratorProfileDto } from '../dto/update-moderator-profile.dto';

@ApiTags('moderator-workflow')
@Controller('moderator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ModeratorWorkflowController {
  constructor(private readonly moderatorWorkflowService: ModeratorWorkflowService) {}

  private getUserIdOrThrow(req: AuthenticatedRequest) {
    const userId = req.user?.sub || req.user?.id;
    const role = req.user?.role;
    if (!userId) throw new ForbiddenException('Unable to resolve authenticated user');
    if (!role || !['MODERATOR', 'ADMIN'].includes(role)) {
      throw new ForbiddenException('Moderator access required');
    }
    return userId;
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get moderator dashboard' })
  async getDashboard(@Req() req: AuthenticatedRequest) {
    this.getUserIdOrThrow(req);
    return this.moderatorWorkflowService.getDashboard();
  }

  @Get('content-queue')
  @ApiOperation({ summary: 'Get moderation content queue' })
  async getContentQueue(
    @Req() req: AuthenticatedRequest,
    @Query('priority') priority?: string,
  ) {
    this.getUserIdOrThrow(req);
    return this.moderatorWorkflowService.getContentQueue(priority);
  }

  @Post('content-queue/:postId/action')
  @ApiOperation({ summary: 'Moderate content item' })
  async moderateContent(
    @Req() req: AuthenticatedRequest,
    @Param('postId') postId: string,
    @Body() dto: ModerateContentDto,
  ) {
    this.getUserIdOrThrow(req);
    return this.moderatorWorkflowService.moderateContent(postId, dto.action);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users for moderation management' })
  async getUsers(@Req() req: AuthenticatedRequest, @Query('search') search?: string) {
    this.getUserIdOrThrow(req);
    return this.moderatorWorkflowService.getUsers(search);
  }

  @Patch('users/:userId/status')
  @ApiOperation({ summary: 'Update user status as moderator' })
  async updateUserStatus(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    this.getUserIdOrThrow(req);
    return this.moderatorWorkflowService.updateUserStatus(userId, dto.status);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get moderator analytics' })
  async getAnalytics(@Req() req: AuthenticatedRequest) {
    this.getUserIdOrThrow(req);
    return this.moderatorWorkflowService.getAnalytics();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get moderator profile' })
  async getProfile(@Req() req: AuthenticatedRequest) {
    const userId = this.getUserIdOrThrow(req);
    return this.moderatorWorkflowService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update moderator profile' })
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateModeratorProfileDto,
  ) {
    const userId = this.getUserIdOrThrow(req);
    return this.moderatorWorkflowService.updateProfile(userId, dto);
  }
}
