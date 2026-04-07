import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  IsOptional,
} from 'class-validator';

export class UpdateMilestoneDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order?: number;
}