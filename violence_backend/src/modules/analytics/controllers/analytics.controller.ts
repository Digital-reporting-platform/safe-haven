import {
  Controller,
  Get,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics' })
  async getDashboardAnalytics(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.analyticsService.getDashboardAnalytics(days);
  }

  @Get('incidents')
  @ApiOperation({ summary: 'Get incident analytics' })
  async getIncidentAnalytics(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.analyticsService.getIncidentAnalytics(days);
  }

  @Get('cases')
  @ApiOperation({ summary: 'Get case management analytics' })
  async getCaseManagementAnalytics(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.analyticsService.getCaseManagementAnalytics(days);
  }

  @Get('professionals')
  @ApiOperation({ summary: 'Get professional directory analytics' })
  async getProfessionalAnalytics() {
    return this.analyticsService.getProfessionalAnalytics();
  }

  @Get('high-risk')
  @ApiOperation({
    summary: 'Get high-risk intervention data',
  })
  async getHighRiskData() {
    return this.analyticsService.getHighRiskInterventionData();
  }

  @Get('report/anonymized')
  @ApiOperation({
    summary: 'Generate anonymized report for stakeholders',
  })
  async generateAnonymizedReport(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.analyticsService.generateAnonymizedReport(days);
  }

  @Get('report/history')
  @ApiOperation({
    summary: 'Get generated anonymized report history',
  })
  async getAnonymizedReportHistory(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.analyticsService.getAnonymizedReportHistory(limit);
  }

  @Get('medical-provider/dashboard')
  @ApiOperation({ summary: 'Get medical provider dashboard data' })
  async getMedicalProviderDashboard() {
    return this.analyticsService.getMedicalProviderDashboard();
  }
}
