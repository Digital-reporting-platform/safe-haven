import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AssignedCaseGuard } from '@/modules/auth/guards/assigned-case.guard';
import {
  Controller, Post, Get, Put, Param, Body, Query, UseGuards, Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ReportsService } from '../services/reports.service';
import { ReportStatus, IncidentCategory, SeverityLevel, UserRole } from '@prisma/client';

// Roles allowed to update report status or classification fields
const STATUS_UPDATE_ROLES: UserRole[] = [
  UserRole.COUNSELOR,
  UserRole.ADMIN,
  UserRole.MEDICAL_PROFESSIONAL,
  UserRole.LEGAL_ADVISOR,
];

// Roles allowed to view any report (not just their own)
const PRIVILEGED_ROLES: UserRole[] = [
  UserRole.COUNSELOR,
  UserRole.ADMIN,
  UserRole.MEDICAL_PROFESSIONAL,
  UserRole.LEGAL_ADVISOR,
];

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an incident report (authenticated or anonymous)' })
  async createReport(@Body() dto: CreateReportDto, @Req() req: any) {
    // Support both authenticated users and anonymous (guest) submissions
    const userId = req.user?.sub || req.user?.id || null;
    const ipAddress = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
    const normalizedIp = Array.isArray(ipAddress) ? ipAddress[0] : ipAddress;

    // Strip skipLocationValidation from user-supplied data — server decides
    const { skipLocationValidation: _skip, ...safeDto } = dto as any;

    const result = await this.reportsService.createReport(
      { ...safeDto, ipAddress: normalizedIp },
      userId,
      false, // skipLocationValidation is never user-controlled
    );

    const response: any = {
      ...result.report,
      classification: result.classification,
      riskScore: result.riskScore,
    };

    if (result.locationValidation?.hasMismatch) {
      response.locationWarning = {
        hasMismatch: true,
        detectedLocation: result.locationValidation.detectedLocation,
        selectedRegion: result.locationValidation.selectedRegion,
        message: result.locationValidation.warningMessage,
        isVpnOrProxy: result.locationValidation.isVpnOrProxy,
      };
    }

    return response;
  }

  @Post('validate-location')
  @ApiOperation({ summary: 'Validate location before report submission' })
  async validateLocation(@Body() body: { region: string; gpsLat?: number; gpsLng?: number }, @Req() req: any) {
    const ipAddress = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
    const normalizedIp = Array.isArray(ipAddress) ? ipAddress[0] : ipAddress;

    return this.reportsService.validateLocation(
      body.region,
      normalizedIp,
      body.gpsLat,
      body.gpsLng,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAll(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('severity') severity?: string,
    @Query('flagged') flagged?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;
    const role = req.user?.role;
    const filters = {
      status: status as ReportStatus | undefined,
      category: category as IncidentCategory | undefined,
      severity: severity as SeverityLevel | undefined,
      flagged: flagged === 'true',
    };
    return this.reportsService.getAllReportsForUser(Number(page), Number(limit), filters, userId, role);
  }

  @Get('high-risk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get high-risk reports (counselor/admin only)' })
  async getHighRisk(@Req() req: any, @Query('limit') limit = 50) {
    const role = req.user?.role as UserRole;
    if (!([UserRole.COUNSELOR, UserRole.ADMIN] as UserRole[]).includes(role)) {
      throw new ForbiddenException('Access denied');
    }
    return this.reportsService.getHighRiskReports(Number(limit));
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get report analytics (counselor/admin only)' })
  async getAnalytics(@Req() req: any, @Query('days') days = 30) {
    const role = req.user?.role as UserRole;
    if (!([UserRole.COUNSELOR, UserRole.ADMIN] as UserRole[]).includes(role)) {
      throw new ForbiddenException('Access denied');
    }
    return this.reportsService.getReportAnalytics(Number(days));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AssignedCaseGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single report (owner or privileged role)' })
  async getOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const role = req.user?.role as UserRole;
    return this.reportsService.getReport(id, userId, role);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update report fields (privileged roles only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateReportDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const role = req.user?.role as UserRole;

    // Only privileged roles can update reports
    if (!STATUS_UPDATE_ROLES.includes(role)) {
      throw new ForbiddenException('You do not have permission to update reports');
    }

    return this.reportsService.updateReport(id, dto, userId, role);
  }

  @Post(':id/evidence')
  @UseGuards(JwtAuthGuard, AssignedCaseGuard)
  @ApiBearerAuth()
  async addEvidence(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const role = req.user?.role as UserRole;
    // Verify the caller owns the report or is privileged
    await this.reportsService.getReport(id, userId, role);
    return this.reportsService.addEvidence(
      id, body.fileUrl, body.fileName, body.fileType, body.fileSize,
    );
  }
}
