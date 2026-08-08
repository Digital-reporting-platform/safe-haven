import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ModerateAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  HIDE = 'HIDE',
}

export class ModerateContentDto {
  @ApiProperty({ enum: ModerateAction })
  @IsEnum(ModerateAction)
  action!: ModerateAction;
}
