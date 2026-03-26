import { Controller, Body, Post } from "@nestjs/common";
import { AuthResearcher } from "./auth.researcher.service";
import { CreateResearcherDto } from "src/auth/dto/dto.auth/dto.users.researcher/dto.users.researcher";

@Controller('auth/researcher')
export class AuthResearcherController {
    constructor(private readonly authResearcher: AuthResearcher){}
    @Post('register')
    registerResearcher(@Body() dto: CreateResearcherDto) {
        return this.authResearcher.registerResearcher(dto);
    }
}