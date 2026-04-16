    import { Body, Controller, Get, Post, UseGuards, Req } from "@nestjs/common";
    import { AuthService } from "./auth.service";
    import { CreateUserDto } from "src/auth/dto/dto.auth/dto.users/dto.user";
    import { LoginDto } from "src/auth/dto/dto.auth/dto.login/dto.login";
    import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

    @Controller('auth')
    export class AuthController {
        constructor(private readonly authService: AuthService) {}

        @Post('register')
        registerDonor(@Body() dto: CreateUserDto) {
            return this.authService.registerUser(dto);
        }

        // backward-compatible alias kept to avoid breaking existing clients
        @Post('regiter')
        registerDonorLegacy(@Body() dto: CreateUserDto) {
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
