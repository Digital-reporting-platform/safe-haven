import { IsString, IsOptional, IsInt, IsDateString, IsEnum } from 'class-validator';
import { MissingPersonStatus } from '@prisma/client';

export class CreateMissingPersonDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsString()
  lastSeenLocation!: string;

  @IsDateString()
  lastSeenDate!: string;

  @IsOptional()
  @IsEnum(MissingPersonStatus)
  status?: MissingPersonStatus;
}
