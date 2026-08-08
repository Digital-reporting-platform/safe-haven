import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength, Matches } from 'class-validator';

export class ActivateAccountDto {
  @ApiProperty({
    description: 'User email address',
    example: 'provider@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({
    description: '6-digit activation OTP code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString({ message: 'OTP must be a string' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp!: string;

  @ApiProperty({
    description: 'New password (min 8 chars, must include uppercase, lowercase, and number)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password!: string;
}
