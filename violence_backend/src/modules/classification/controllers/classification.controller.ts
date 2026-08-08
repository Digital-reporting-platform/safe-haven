import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClassificationService } from '../services/classification.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateClassificationDto } from '../dto/create-classification.dto';

@ApiTags('classification')
@Controller('classification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ClassificationController {
  constructor(private classificationService: ClassificationService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze and classify incident report' })
  async analyzeReport(@Body() dto: CreateClassificationDto) {
    const classification = await this.classificationService.classifyReport(
      dto.text,
    );

    const riskScore = await this.classificationService.calculateRiskScore(
      dto.text,
      dto.ipAddress || null,
      dto.deviceFingerprint || null,
    );

    return {
      classification,
      riskScore,
      recommendation: {
        shouldReview:
          classification.confidence < 0.5 || riskScore.flagged,
        priority: this.determinePriority(
          classification.severity,
          riskScore.riskScore,
        ),
        requiresManualReview: classification.confidence < 0.6,
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get classification statistics' })
  async getStats() {
    return this.classificationService.getClassificationStats();
  }

  private determinePriority(severity: string, riskScore: number): string {
    if (severity === 'CRITICAL' || riskScore > 70) return 'CRITICAL';
    if (severity === 'HIGH' || riskScore > 50) return 'HIGH';
    if (severity === 'MEDIUM' || riskScore > 30) return 'MEDIUM';
    return 'LOW';
  }
}
