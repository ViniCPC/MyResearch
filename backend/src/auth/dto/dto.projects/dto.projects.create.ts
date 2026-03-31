import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min, IsEthereumAddress } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from 'generated/prisma/enums';

export class CreateProjectDto {
  @IsString()
  @MaxLength(150)
  title: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  goalAmount: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsEthereumAddress()
  contractAddress?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}