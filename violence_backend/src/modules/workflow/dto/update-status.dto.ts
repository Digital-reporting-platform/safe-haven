import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'The new status to transition to',
    enum: ReportStatus,
    example: 'RECEIVED',
  })
  @IsEnum(ReportStatus)
  status!: ReportStatus;

  @ApiPropertyOptional({
    description: 'Optional notes about the status change',
    example: 'Case reviewed and accepted by counselor',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BatchUpdateStatusDto {
  @ApiProperty({
    description: 'Array of report IDs to update',
    example: ['report-1', 'report-2'],
    type: [String],
  })
  @IsString({ each: true })
  reportIds!: string[];

  @ApiProperty({
    description: 'The new status to transition all reports to',
    enum: ReportStatus,
    example: 'CLOSED',
  })
  @IsEnum(ReportStatus)
  status!: ReportStatus;
}

export class StatusTransitionResponseDto {
  @ApiProperty({ description: 'Whether the transition was successful' })
  success!: boolean;

  @ApiProperty({ description: 'Previous status' })
  previousStatus!: string;

  @ApiProperty({ description: 'New status' })
  newStatus!: string;

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  progressPercentage!: number;

  @ApiPropertyOptional({ description: 'Whether case assignment was synchronized' })
  caseAssignmentUpdated?: boolean;

  @ApiPropertyOptional({ description: 'Status message' })
  message?: string;
}

export class ProgressViewDto {
  @ApiProperty({ description: 'Report ID' })
  reportId!: string;

  @ApiProperty({ description: 'Technical status' })
  status!: string;

  @ApiProperty({ description: 'User-friendly status label' })
  label!: string;

  @ApiProperty({ description: 'User-friendly status message' })
  message!: string;

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  progressPercentage!: number;

  @ApiProperty({ description: 'Report creation date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Report last update date' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Report title' })
  title!: string;

  @ApiProperty({ description: 'Incident category' })
  category!: string;

  @ApiProperty({ description: 'Whether the user can view full details' })
  canViewDetails!: boolean;
}

export class StatusHistoryEntryDto {
  @ApiProperty({ description: 'Status at this point in time' })
  status!: string;

  @ApiProperty({ description: 'Timestamp of the status change' })
  timestamp!: string;

  @ApiProperty({ description: 'User ID who made the change' })
  changedBy!: string;

  @ApiProperty({ description: 'Role of the user who made the change' })
  changedByRole!: string;

  @ApiPropertyOptional({ description: 'Optional notes' })
  notes?: string;
}

export class TimelineResponseDto {
  @ApiProperty({ description: 'Report ID', type: String })
  reportId!: string;

  @ApiProperty({
    description: 'Status history timeline',
    type: [StatusHistoryEntryDto],
  })
  timeline!: StatusHistoryEntryDto[];
}

export class AllowedTransitionsDto {
  @ApiProperty({ description: 'Current status' })
  currentStatus!: string;

  @ApiProperty({
    description: 'List of statuses this user can transition to',
    type: [String],
  })
  allowedTransitions!: string[];
}
