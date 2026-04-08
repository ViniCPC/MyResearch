import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateMilestoneDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;
}