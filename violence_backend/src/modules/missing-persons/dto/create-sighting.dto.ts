import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsEmail } from 'class-validator';

export class CreateSightingDto {

  @ApiProperty({
    description: 'Location where the person was sighted',
    example: 'Addis Ababa, Bole area near the airport',
  })
  @IsString()
  location!: string;

  @ApiProperty({
    description: 'Date and time of the sighting',
    example: '2025-01-20T14:30:00Z',
  })
  @IsDateString()
  sightingDate!: string;

  @ApiProperty({
    description: 'Additional details about the sighting',
    example: 'Person was seen walking with another individual',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Name of the person reporting the sighting',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiProperty({
    description: 'Phone number for follow-up',
    example: '+251911234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({
    description: 'Email for follow-up',
    example: 'reporter@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}
