import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePatientDto {
  @ApiPropertyOptional({ example: 'Sarah' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Johnson' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  phone?: string;

  @ApiPropertyOptional({ example: 'sarah.johnson@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

