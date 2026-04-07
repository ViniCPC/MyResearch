import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateMilestoneDto {
  @IsString()
  @MaxLength(150)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  order!: number;
}