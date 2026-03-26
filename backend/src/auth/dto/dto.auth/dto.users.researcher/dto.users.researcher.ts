import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateResearcherDto {
    @IsString()
    name: string

    @IsEmail()
    email: string

    @IsString()
    @MinLength(6)
    password: string

    @IsString()
    institution: string
}