import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceProviderType } from '@prisma/client';

export class CreateServiceProviderDto {
  @ApiProperty({
    description: 'Name of the service provider',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Type of service provider',
    enum: ServiceProviderType,
  })
  @IsEnum(ServiceProviderType)
  type!: ServiceProviderType;

  @ApiProperty({
    description: 'Email address',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Physical address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'City',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Country',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'Description of services',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Website URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    description: 'Languages spoken',
    default: ['en'],
  })
  @IsOptional()
  @IsArray()
  languages?: string[];

  @ApiProperty({
    description: 'Specializations/expertise areas',
    default: [],
  })
  @IsOptional()
  @IsArray()
  specializations?: string[];

  @ApiProperty({
    description: 'Availability status',
    default: 'available',
  })
  @IsOptional()
  @IsString()
  availability?: string;
}
