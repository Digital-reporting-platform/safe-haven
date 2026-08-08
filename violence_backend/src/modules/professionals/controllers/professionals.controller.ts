import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProfessionalsService } from '../services/professionals.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateServiceProviderDto } from '../dto/create-service-provider.dto';
import { ServiceProviderType } from '@prisma/client';

@ApiTags('professionals')
@Controller('professionals')
@ApiBearerAuth()
export class ProfessionalsController {
  constructor(private professionalsService: ProfessionalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register a new service provider' })
  async createServiceProvider(@Body() dto: CreateServiceProviderDto) {
    return this.professionalsService.createServiceProvider(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all verified service providers' })
  async getServiceProviders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: ServiceProviderType,
    @Query('verified') verified?: string,
    @Query('city') city?: string,
    @Query('search') search?: string,
  ) {
    return this.professionalsService.getServiceProviders(page, limit, {
      type,
      verified: verified === undefined ? undefined : verified === 'true',
      city,
      search,
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search service directory' })
  async searchServiceDirectory(
    @Query('query') query: string,
    @Query('type') type?: ServiceProviderType,
    @Query('city') city?: string,
    @Query('language') language?: string,
  ) {
    return this.professionalsService.searchServiceDirectory(query, {
      type,
      city,
      language,
    });
  }

  @Get('directory')
  @ApiOperation({ summary: 'Get complete service directory' })
  async getServiceDirectory(@Query('type') type?: ServiceProviderType) {
    return this.professionalsService.getServiceDirectory(type);
  }

  @Get('specialists')
  @ApiOperation({
    summary: 'Find specialists by category and location',
  })
  async findSpecialists(
    @Query('category') category: string,
    @Query('location') location?: string,
    @Query('language') language?: string,
  ) {
    return this.professionalsService.findSpecialists(
      category,
      location,
      language,
    );
  }

  @Get('recommended')
  @ApiOperation({
    summary: 'Get recommended professionals for case type',
  })
  async getRecommended(
    @Query('caseType') caseType: string,
    @Query('severity') severity: string,
    @Query('location') location?: string,
  ) {
    return this.professionalsService.getRecommendedProfessionals(
      caseType,
      severity,
      location,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get professionals statistics' })
  async getStats() {
    return this.professionalsService.getProfessionalsStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service provider details' })
  async getServiceProvider(@Param('id') id: string) {
    return this.professionalsService.getServiceProvider(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update service provider information' })
  async updateServiceProvider(
    @Param('id') id: string,
    @Body() dto: Partial<CreateServiceProviderDto>,
  ) {
    return this.professionalsService.updateServiceProvider(id, dto);
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify service provider (admin only)' })
  async verifyServiceProvider(@Param('id') id: string) {
    return this.professionalsService.verifyServiceProvider(id);
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add review to service provider' })
  async addReview(
    @Param('id') id: string,
    @Body() body: { rating: number; feedback?: string },
  ) {
    return this.professionalsService.addReview(
      id,
      body.rating,
      body.feedback,
    );
  }
}
