import { Module } from "@nestjs/common";

import { AuthResearcherController } from "./auth.researcher.controller";
import { AuthResearcher } from "./auth.researcher.service";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [AuthResearcherController],
    providers: [AuthResearcher]
})

export class AuthResearcherMdule {};