import { Type } from "class-transformer";
import { IsString, MaxLength, IsNumber, Min, IsOptional, IsUrl, IsEthereumAddress, IsEnum} from "class-validator";
import { ProjectStatus } from "generated/prisma/enums";

export class updateProjectDto {
    @IsString()
    @MaxLength(150)
    title: string

    @IsString()
    @MaxLength(2000)
    description: string

    @Type(() => Number)
    @IsNumber({maxDecimalPlaces: 2})
    @Min(0)
    goalAmount: number

    @IsOptional()
    @IsUrl()
    imageUrl: string

    @IsOptional()
    @IsEthereumAddress()
    contractAddress: string;

    @IsOptional()
    @IsEnum(ProjectStatus)
    status: string;
}