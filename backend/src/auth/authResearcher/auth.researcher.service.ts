import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateResearcherDto } from "src/auth/dto/dto.users.researcher/dto.users.researcher";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrpty from 'bcrypt';
import { Role } from "generated/prisma/enums";

@Injectable()
export class AuthResearcher {
    constructor(private readonly prisma: PrismaService) {}

    async registerResearcher(dto: CreateResearcherDto) {
        const emailExisting = await this.prisma.user.findUnique({
            where: {email: dto.email}
        })

        if(emailExisting) {
            throw new BadRequestException("Email já está cadástrado");
        }

        const passwordHash = await bcrpty.hash(dto.password, 10);

        const userResearcher = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash: passwordHash,
                role: Role.RESEARCHER,
                institutionName: dto.institution
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                institutionName: true,
                createdAt: true

            }
        })
        return userResearcher;
    }
}