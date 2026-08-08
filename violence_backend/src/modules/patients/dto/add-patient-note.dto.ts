import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddPatientNoteDto {
  @ApiProperty({ example: 'Patient reports reduced chest tightness since last visit.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @ApiProperty({ required: false, example: 'cm4abcxyz123' })
  @IsOptional()
  @IsString()
  reportId?: string;
}
