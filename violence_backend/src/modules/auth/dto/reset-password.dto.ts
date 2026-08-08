import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset token',
    example: 'abc123xyz',
  })
  @IsNotEmpty({ message: 'Token is required' })
  @IsString()
  token!: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewPassword123!',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;
}