import { IsNumber, IsPositive, IsString } from "class-validator";

export class RegisterDonationDto {
    @IsNumber()
    @IsPositive()
    donation!: Number;

    @IsString()
    txHash!: string

}