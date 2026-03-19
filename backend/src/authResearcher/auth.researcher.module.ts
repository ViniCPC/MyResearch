import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthResearcherController } from "./auth.researcher.controller";
import { AuthResearcher } from "./auth.researcher.service";

@Module({
    imports: [PrismaService],
    controllers: [AuthResearcherController],
    providers: [AuthResearcher]
})

export class AuthResearcherMdule {};