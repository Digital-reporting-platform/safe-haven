import { ApiProperty } from '@nestjs/swagger';
import { IncidentCategory } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: 'Report title',
    example: 'Report: Physical Violence',
  })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the incident',
    example: 'I experienced an incident where...',
  })
  @IsString()
  @MaxLength(5000)
  description!: string;

  @ApiProperty({
    description: 'Incident category',
    enum: IncidentCategory,
    required: false,
    example: 'PHYSICAL_VIOLENCE',
  })
  @IsOptional()
  @IsEnum(IncidentCategory)
  category?: IncidentCategory;

  @ApiProperty({
    description: 'Is the report anonymous',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean = true;

  @ApiProperty({
    description: 'Language of the report (en, am)',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Location of the incident',
    required: false,
    example: 'Addis Ababa',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Approximate occurrence date/time in ISO format',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @ApiProperty({
    description: 'Browser geolocation latitude when permission is granted',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  gpsLat?: number;

  @ApiProperty({
    description: 'Browser geolocation longitude when permission is granted',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  gpsLng?: number;

  @ApiProperty({
    description: 'IP address (automatically captured)',
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'Device fingerprint for fraud detection',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;

  @ApiProperty({
    description:
      'Location mismatch flag from browser geolocation check (non-blocking review flag)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  flaggedForLocation?: boolean;

  @ApiProperty({
    description: 'Skip location validation (used after user confirms location mismatch)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  skipLocationValidation?: boolean;

  @ApiProperty({
    description: 'User confirmed the location mismatch warning',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  locationMismatchConfirmed?: boolean;

  @ApiProperty({
    description: 'Behavioral analysis data for fraud detection',
    required: false,
  })
  @IsOptional()
  behavioralData?: {
    sessionDuration?: number;
    stepDurations?: Record<string, number>;
    avgKeystrokeInterval?: number;
    mouseMovementCount?: number;
    copyPasteCount?: number;
    behavioralRiskScore?: number;
    locationPrecision?: string;
    safetyConcern?: string;
    disclosureWillingness?: number;
    timeToDisclosure?: number;
    reporterLocationConfidence?: string;
  };
}
