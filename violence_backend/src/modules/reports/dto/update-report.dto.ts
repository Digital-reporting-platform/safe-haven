import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus, IncidentCategory, SeverityLevel } from '@prisma/client';

export class UpdateReportDto {
  @ApiProperty({
    description: 'Update report status',
    enum: ReportStatus,
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiProperty({
    description: 'Update incident category',
    enum: IncidentCategory,
  })
  @IsOptional()
  @IsEnum(IncidentCategory)
  category?: IncidentCategory;

  @ApiProperty({
    description: 'Update severity level',
    enum: SeverityLevel,
  })
  @IsOptional()
  @IsEnum(SeverityLevel)
  severity?: SeverityLevel;

  @ApiProperty({
    description: 'Update suggested case type',
  })
  @IsOptional()
  @IsString()
  suggestedCaseType?: string;

  @ApiProperty({
    description: 'Classification notes from counselor review',
  })
  @IsOptional()
  @IsString()
  classificationNotes?: string;

  @ApiProperty({
    description: 'Whether ML classification has been confirmed by counselor',
  })
  @IsOptional()
  classificationConfirmed?: boolean;
}
