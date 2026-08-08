import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { UpdateSystemSettingDto } from '../dto/system-settings.dto';
import { SystemSettingsService } from '../services/system-settings.service';

@ApiTags('system-settings')
@Controller('system-settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all system settings (admin only)' })
  async getAll(@Request() req: any) {
    this.settingsService.ensureAdmin(req.user?.role);
    return this.settingsService.getAllSettings();
  }

  @Put(':category')
  @ApiOperation({ summary: 'Update settings by category (admin only)' })
  async updateCategory(
    @Request() req: any,
    @Param('category') category: string,
    @Body() dto: UpdateSystemSettingDto,
  ) {
    this.settingsService.ensureAdmin(req.user?.role);
    return this.settingsService.updateCategory(category, dto.data, req.user?.sub);
  }
}
