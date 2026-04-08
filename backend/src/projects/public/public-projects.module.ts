import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectsController } from './public-projects.controller';
import { ProjectsServicePublic } from './public-projects.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController],
  providers: [ProjectsServicePublic],
})
export class PublicProjectsModule {}