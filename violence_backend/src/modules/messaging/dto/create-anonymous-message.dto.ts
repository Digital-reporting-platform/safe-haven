import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateAnonymousMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: 'Message content cannot exceed 5000 characters' })
  content!: string;

  @IsString()
  @IsNotEmpty()
  trackingNumber!: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;
}
