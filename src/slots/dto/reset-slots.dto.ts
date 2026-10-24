import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class ResetSlotDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsDateString()
  start!: string;

  @IsDateString()
  end!: string;
}

export class ResetSlotsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResetSlotDto)
  slots!: ResetSlotDto[];
}
