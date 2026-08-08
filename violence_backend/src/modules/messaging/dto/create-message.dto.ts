import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: 'Message content cannot exceed 5000 characters' })
  content!: string;

  @IsEnum(UserRole)
  @IsOptional()
  senderRole?: UserRole = UserRole.SURVIVOR;

  @IsBoolean()
  @IsOptional()
  isSystemMessage?: boolean = false;

  @IsString()
  @IsOptional()
  trackingNumber?: string;
}
