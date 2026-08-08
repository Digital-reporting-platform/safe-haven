import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class InviteUserDto {
  @ApiProperty({
    description: 'Email address of the user to invite',
    example: 'counselor@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({
    description: 'Role to assign to the invited user',
    enum: UserRole,
    example: 'COUNSELOR',
  })
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role!: UserRole;

  @ApiProperty({
    description: 'First name (optional)',
    example: 'Jane',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @ApiProperty({
    description: 'Last name (optional)',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;
}
