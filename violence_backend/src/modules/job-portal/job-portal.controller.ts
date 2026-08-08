import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JobPortalService } from './job-portal.service';
import { JobSyncService } from './job-sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('job-portal')
@Controller('job-portal')
export class JobPortalController {
  constructor(
    private readonly jobPortalService: JobPortalService,
    private readonly jobSyncService: JobSyncService,
  ) {}

  @Get('public')
  @ApiOperation({ summary: 'Get all public job opportunities' })
  async getPublic() {
    return this.jobPortalService.getPublicJobs();
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommended')
  @ApiOperation({ summary: 'Get personalized job recommendations' })
  async getRecommended(@Request() req: any) {
    return this.jobPortalService.getRecommendedJobs(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('save/:jobId')
  @ApiOperation({ summary: 'Save a job opportunity' })
  async saveJob(@Request() req: any, @Param('jobId') jobId: string) {
    return this.jobPortalService.saveJob(req.user.sub, jobId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('save/:jobId')
  @ApiOperation({ summary: 'Unsave a job opportunity' })
  async unsaveJob(@Request() req: any, @Param('jobId') jobId: string) {
    return this.jobPortalService.unsaveJob(req.user.sub, jobId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('saved')
  @ApiOperation({ summary: 'Get all saved jobs' })
  async getSavedJobs(@Request() req: any) {
    return this.jobPortalService.getSavedJobs(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('apply/:jobId')
  @ApiOperation({ summary: 'Apply to a job' })
  async applyToJob(
    @Request() req: any,
    @Param('jobId') jobId: string,
    @Body() body: { notes?: string },
  ) {
    return this.jobPortalService.applyToJob(req.user.sub, jobId, body.notes);
  }

  @UseGuards(JwtAuthGuard)
  @Get('applications')
  @ApiOperation({ summary: 'Get all my job applications' })
  async getMyApplications(@Request() req: any) {
    return this.jobPortalService.getMyApplications(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('applications/:applicationId/status')
  @ApiOperation({ summary: 'Update application status' })
  async updateApplicationStatus(
    @Request() req: any,
    @Param('applicationId') applicationId: string,
    @Body() body: { status: string },
  ) {
    return this.jobPortalService.updateApplicationStatus(req.user.sub, applicationId, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync')
  @ApiOperation({ summary: 'Manually trigger job sync from external sources (Admin only)' })
  async manualSync() {
    await this.jobSyncService.manualSync();
    return { message: 'Job sync completed successfully' };
  }
}
