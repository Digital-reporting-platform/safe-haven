import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { OTPType } from '@prisma/client';

export class ResendOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({
    description: 'Type of OTP to resend',
    enum: OTPType,
    example: 'EMAIL_VERIFICATION',
  })
  @IsEnum(OTPType, { message: 'Invalid OTP type' })
  type!: OTPType;
}
