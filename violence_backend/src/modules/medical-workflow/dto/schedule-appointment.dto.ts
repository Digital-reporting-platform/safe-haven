import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ScheduleAppointmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({ example: '2026-04-10' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ example: '09:30' })
  @IsString()
  @IsNotEmpty()
  time!: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: 'Consultation' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'Room 101' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Follow-up required' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

