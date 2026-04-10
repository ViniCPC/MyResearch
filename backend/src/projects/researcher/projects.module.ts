import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResearcherProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ResearcherProjectsController],
  providers: [ProjectsService],
})
export class ResearcherProjectsModule {}