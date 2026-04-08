import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/authUser/auth.module';
import { PublicProjectsModule } from './projects/public/public-projects.module';
import { ResearcherProjectsModule } from './projects/researcher/projects.module';

@Module({
  imports: [AuthModule, PublicProjectsModule, ResearcherProjectsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
