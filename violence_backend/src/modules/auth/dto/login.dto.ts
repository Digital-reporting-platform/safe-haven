import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString()
  email!: string;

  @ApiProperty({
    description: 'Password',
    example: 'Password123',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password!: string;
}
