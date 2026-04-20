import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/authUser/auth.module';
import { AuthResearcherModule } from './auth/authResearcher/auth.researcher.module';
import { PublicProjectsModule } from './projects/public/public-projects.module';
import { ResearcherProjectsModule } from './projects/researcher/projects.module';
import { DonationsModule } from './donation/donations.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { MilestoneModule } from './milestone/milestone.module';

@Module({
  imports: [
    AuthModule,
    AuthResearcherModule,
    PublicProjectsModule,
    ResearcherProjectsModule,
    DonationsModule,
    MilestoneModule,
    BlockchainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
