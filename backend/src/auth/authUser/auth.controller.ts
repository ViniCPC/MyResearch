    import { Body, Controller, Get, Post, UseGuards, Req } from "@nestjs/common";
    import { AuthService } from "./auth.service";
    import { CreateUserDto } from "src/auth/dto/dto.users/dto.user";
    import { LoginDto } from "src/auth/dto/dto.login/dto.login";
    import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

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
        me(@Req() req: Request) {
            return req['user'];
        }
    }