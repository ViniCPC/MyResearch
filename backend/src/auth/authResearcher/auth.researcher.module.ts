import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthResearcherController } from "./auth.researcher.controller";
import { AuthResearcher } from "./auth.researcher.service";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
    imports: [
        PrismaModule,
        JwtModule,
    ],
    controllers: [AuthResearcherController],
    providers: [AuthResearcher]
})
export class AuthResearcherModule {}