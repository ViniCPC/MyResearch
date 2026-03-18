import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/dto/dto.users/dto.user";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('regiter')
    registerDonor(@Body() dto: CreateUserDto) {
        return this.authService.regiterUser(dto);
    }
}