import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from 'bcrypt'
import { CreateUserDto } from "src/dto/dto.users/dto.user";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Role } from "generated/prisma/enums";

@Injectable()
export class authUser {
    constructor(private readonly prisma: PrismaService) {}
    async regiterUser(dto: CreateUserDto) {
        const userExisting = await this.prisma.user.findUnique({
            where: {email: dto.email}
        })

        if(userExisting) {
            throw new BadRequestException("Email já cadastrado");
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user =  await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash: passwordHash,
                role: Role.DONOR
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        })

        return user;
    }
}