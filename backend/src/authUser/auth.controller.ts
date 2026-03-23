import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/dto/dto.users/dto.user";
import { LoginDto } from "src/dto/dto.login/dto.login";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('regiter')
    registerDonor(@Body() dto: CreateUserDto) {
        return this.authService.registerUser(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}