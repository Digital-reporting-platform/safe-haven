import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CaseType, CasePriority } from '@prisma/client';

export class CreateCaseAssignmentDto {
  @ApiProperty({
    description: 'Professional/Service Provider ID',
  })
  @IsString()
  assignedToId!: string;

  @ApiProperty({
    description: 'Type of case/support needed',
    enum: CaseType,
  })
  @IsEnum(CaseType)
  caseType!: CaseType;

  @ApiProperty({
    description: 'Case priority level',
    enum: CasePriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(CasePriority)
  priority?: CasePriority;

  @ApiProperty({
    description: 'Additional notes for the assignment',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
