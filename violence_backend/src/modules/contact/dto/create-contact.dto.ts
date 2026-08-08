import { IsString, IsEmail, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactInquiryType, ContactUrgency } from '@prisma/client';

export class CreateContactDto {
  @ApiProperty({
    description: 'Full name of contact person',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Email address of contact person',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({
    description: 'Phone number of the contact person',
    example: '+1 (555) 123-4567',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Company or organization name',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({
    description: 'Subject of the inquiry',
    example: 'Question about privacy policy',
  })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({
    description: 'Type of inquiry',
    enum: ContactInquiryType,
    example: ContactInquiryType.GENERAL,
  })
  @IsEnum(ContactInquiryType)
  @IsNotEmpty()
  inquiryType!: ContactInquiryType;

  @ApiProperty({
    description: 'Urgency level of inquiry',
    enum: ContactUrgency,
    example: ContactUrgency.NORMAL,
  })
  @IsEnum(ContactUrgency)
  urgency!: ContactUrgency;

  @ApiProperty({
    description: 'Detailed message',
    example: 'I have a question about how my data is protected...',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
