import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ScheduleExaminationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ example: 'Sexual Assault Exam' })
  @IsString()
  @IsNotEmpty()
  examType!: string;

  @ApiProperty({ example: '2026-04-10' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  @IsNotEmpty()
  time!: string;

  @ApiPropertyOptional({ example: 'Medical Center Room 5' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

