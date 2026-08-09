import { IsString, IsOptional, IsInt, IsDateString, IsEnum, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from 'class-validator';
import { MissingPersonStatus } from '@prisma/client';

@ValidatorConstraint({ name: 'isRecentDate', async: false })
export class IsRecentDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string, args: ValidationArguments) {
    if (!dateString) return true;
    
    const lastSeenDate = new Date(dateString);
    const now = new Date();
    const diffInDays = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // The last seen date must be within the last 30 days
    return diffInDays <= 30 && diffInDays >= 0;
  }

  defaultMessage(args: ValidationArguments) {
    return 'The last seen date must be within the last 30 days';
  }
}

export class CreateMissingPersonDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsString()
  lastSeenLocation!: string;

  @IsDateString()
  @Validate(IsRecentDateConstraint)
  lastSeenDate!: string;

  @IsOptional()
  @IsEnum(MissingPersonStatus)
  status?: MissingPersonStatus;
}
