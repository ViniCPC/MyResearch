import { Transform } from 'class-transformer';
import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class RegisterDonationDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @MinLength(10)
  txHash!: string;
}