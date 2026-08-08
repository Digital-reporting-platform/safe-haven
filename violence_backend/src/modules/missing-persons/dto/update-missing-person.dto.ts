import { IsString, IsOptional, IsInt, IsDateString, IsEnum } from 'class-validator';
import { MissingPersonStatus } from '@prisma/client';

export class UpdateMissingPersonDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  lastSeenLocation?: string;

  @IsOptional()
  @IsDateString()
  lastSeenDate?: string;

  @IsOptional()
  @IsEnum(MissingPersonStatus)
  status?: MissingPersonStatus;

  @IsOptional()
  @IsDateString()
  resolvedAt?: string;
}
