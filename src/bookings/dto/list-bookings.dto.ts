import { Transform, Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListBookingsDto {
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;

  @IsOptional()
  @IsString()
  cursor?: string;
}
