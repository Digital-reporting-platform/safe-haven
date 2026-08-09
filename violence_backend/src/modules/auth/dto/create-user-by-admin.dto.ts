import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateUserByAdminDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsString()
  email!: string;

  @ApiProperty({
    description:
      'Password (minimum 8 characters, must contain uppercase, lowercase, and number)',
    example: 'Password123',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password must not exceed 72 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password!: string;

  @ApiProperty({
    description: 'First name',
    required: false,
    example: 'John',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Matches(/^[\p{L}\s'-]+$/u, {
    message:
      'First name can only contain letters, spaces, hyphens, and apostrophes',
  })
  firstName?: string;

  @ApiProperty({
    description: 'Last name',
    required: false,
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Matches(/^[\p{L}\s'-]+$/u, {
    message:
      'Last name can only contain letters, spaces, hyphens, and apostrophes',
  })
  lastName?: string;

  @ApiProperty({
    description: 'Phone number',
    required: false,
    example: '+251912345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\+?[1-9]\d{6,14})$/, { message: 'Please provide a valid phone number' })
  phone?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: 'COUNSELOR',
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase().replace(/[\s-]+/g, '_')
      : value,
  )
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({
    description: 'Preferred language (en, am)',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;
}
