import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MissingPersonsService } from '../services/missing-persons.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateMissingPersonDto } from '../dto/create-missing-person.dto';
import { UpdateMissingPersonDto } from '../dto/update-missing-person.dto';
import { CreateSightingDto } from '../dto/create-sighting.dto';
import { MissingPersonStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

@ApiTags('missing-persons')
@Controller('missing-persons')
export class MissingPersonsController {
  constructor(
    private missingPersonsService: MissingPersonsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Report a missing person (public - no auth required)' })
  create(@Body() dto: CreateMissingPersonDto) {
    return this.missingPersonsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all missing persons reports' })
  findAll(
    @Query('status') status?: MissingPersonStatus,
    @Query('search') search?: string,
  ) {
    return this.missingPersonsService.findAll(status, search);
  }

  @Get('admin/stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SYSTEM)
  @ApiOperation({ summary: 'Get missing persons statistics by status (admin only)' })
  async getStats() {
    const [pending, active, found, closed] = await Promise.all([
      this.missingPersonsService.countByStatus(MissingPersonStatus.PENDING),
      this.missingPersonsService.countByStatus(MissingPersonStatus.ACTIVE),
      this.missingPersonsService.countByStatus(MissingPersonStatus.FOUND),
      this.missingPersonsService.countByStatus(MissingPersonStatus.CLOSED),
    ]);
    return {
      total: pending + active + found + closed,
      byStatus: {
        pending,
        active,
        found,
        closed,
      },
    };
  }

  @Get('admin/pending')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.SYSTEM)
  @ApiOperation({ summary: 'Get all pending missing person reports (admin/counselor only)' })
  getPendingReports() {
    return this.missingPersonsService.findAll(MissingPersonStatus.PENDING);
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SYSTEM)
  @ApiOperation({ summary: 'Get all missing person reports with any status (admin only)' })
  getAllReports(@Query('status') status?: MissingPersonStatus) {
    return this.missingPersonsService.findAll(status);
  }

  @Get('admin/sightings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.SYSTEM)
  @ApiOperation({ summary: 'Get all sightings for admin review' })
  async getAllSightings(@Query('verified') verified?: string) {
    console.log('Backend: getAllSightings called with verified:', verified);
    const where = verified !== undefined ? { isVerified: verified === 'true' } : {};
    console.log('Backend: where clause:', where);
    const sightings = await this.prisma.sighting.findMany({
      where,
      include: { missingPerson: true },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`Backend: Found ${sightings.length} sightings`);
    return sightings;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get missing person by ID' })
  findOne(@Param('id') id: string) {
    return this.missingPersonsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update missing person report' })
  update(@Param('id') id: string, @Body() dto: UpdateMissingPersonDto) {
    return this.missingPersonsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete missing person report' })
  remove(@Param('id') id: string) {
    return this.missingPersonsService.remove(id);
  }

  @Patch(':id/found')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark missing person as found' })
  markAsFound(@Param('id') id: string) {
    return this.missingPersonsService.markAsFound(id);
  }

  // ==================== ADMIN ENDPOINTS ====================


  // ==================== SIGHTINGS ENDPOINTS ====================

  @Post(':id/sightings')
  @ApiOperation({ summary: 'Report a sighting for a missing person (public - no auth required)' })
  async createSighting(
    @Param('id') missingPersonId: string,
    @Body() dto: CreateSightingDto,
  ) {
    return this.prisma.sighting.create({
      data: {
        missingPersonId,
        location: dto.location,
        sightingDate: new Date(dto.sightingDate),
        description: dto.description,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        isVerified: false,
      },
    });
  }

  @Get(':id/sightings')
  @ApiOperation({ summary: 'Get all sightings for a missing person (public)' })
  async getSightings(@Param('id') missingPersonId: string) {
    return this.prisma.sighting.findMany({
      where: { missingPersonId },
      orderBy: { sightingDate: 'desc' },
    });
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.SYSTEM)
  @ApiOperation({ summary: 'Approve a missing person report (sets status to ACTIVE)' })
  approveReport(@Param('id') id: string) {
    return this.missingPersonsService.update(id, { status: MissingPersonStatus.ACTIVE });
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SYSTEM)
  @ApiOperation({ summary: 'Reject/close a missing person report (sets status to CLOSED)' })
  rejectReport(@Param('id') id: string) {
    return this.missingPersonsService.update(id, { status: MissingPersonStatus.CLOSED });
  }

  @Patch('sightings/:sightingId/verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR, UserRole.SYSTEM)
  @ApiOperation({ summary: 'Verify a sighting report' })
  async verifySighting(@Param('sightingId') sightingId: string) {
    return this.prisma.sighting.update({
      where: { id: sightingId },
      data: { isVerified: true },
    });
  }
}
