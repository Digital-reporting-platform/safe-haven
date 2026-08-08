import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({
    description: '6-digit MFA/Login OTP code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString({ message: 'OTP must be a string' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp!: string;

  @ApiProperty({
    description: 'OTP type (for frontend reference)',
    example: 'LOGIN_OTP',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;
}
