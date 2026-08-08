import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassificationDto {
  @ApiProperty({
    description: 'Incident report text to analyze',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  text!: string;

  @ApiProperty({
    description: 'IP address of reporter (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'Device fingerprint (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}
