import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/dto/dto.users/dto.user";
import { LoginDto } from "src/dto/dto.login/dto.login";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { GuardsConsumer } from "@nestjs/core/guards";

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

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me() {
        return "Rota protegida";
    }
}