import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/common/types/authenticated-request.type';
import { MedicalProfileService } from '../services/medical-profile.service';
import { UpdateMedicalProfileDto } from '../dto/update-medical-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('medical-profile')
@Controller('medical-provider/profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MedicalProfileController {
  constructor(private readonly medicalProfileService: MedicalProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current medical provider profile' })
  async getProfile(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.sub || req.user?.id;
    const role = req.user?.role;
    if (!userId) throw new ForbiddenException('Unable to resolve authenticated user');
    if (!role || !['MEDICAL_PROFESSIONAL', 'ADMIN'].includes(role)) {
      throw new ForbiddenException('Medical provider access required');
    }
    return this.medicalProfileService.getProfile(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update current medical provider profile' })
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateMedicalProfileDto,
  ) {
    const userId = req.user?.sub || req.user?.id;
    const role = req.user?.role;
    if (!userId) throw new ForbiddenException('Unable to resolve authenticated user');
    if (!role || !['MEDICAL_PROFESSIONAL', 'ADMIN'].includes(role)) {
      throw new ForbiddenException('Medical provider access required');
    }
    return this.medicalProfileService.updateProfile(userId, dto);
  }

  @Post('resume')
  @ApiOperation({ summary: 'Upload medical provider resume file' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, _file: any, cb: (error: Error | null, destination: string) => void) => {
          const userId = (req as any)?.user?.sub || (req as any)?.user?.id || 'unknown';
          const dir = path.join(process.cwd(), 'uploads', 'medical-profiles', userId);
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req: any, file: any, cb: (error: Error | null, filename: string) => void) => {
          const timestamp = Date.now();
          const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          cb(null, `${timestamp}-${safe}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadResume(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    const role = req.user?.role;
    if (!userId) throw new ForbiddenException('Unable to resolve authenticated user');
    if (!role || !['MEDICAL_PROFESSIONAL', 'ADMIN'].includes(role)) {
      throw new ForbiddenException('Medical provider access required');
    }
    if (!file) throw new ForbiddenException('No file uploaded');

    const relativePath = path
      .join('uploads', 'medical-profiles', userId, file.filename)
      .replace(/\\/g, '/');
    const host = (req as any).headers?.host || 'localhost:4000';
    const proto = ((req as any).headers?.['x-forwarded-proto'] || 'http') as string;
    const resumeUrl = `${proto}://${host}/${relativePath}`;

    const profile = await this.medicalProfileService.updateResumeUrl(userId, resumeUrl);
    return { resumeUrl, profile };
  }
}
