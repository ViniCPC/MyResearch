import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MilestonesController } from './milestone.controller';
import { MilestoneService } from './milestone.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [MilestonesController],
  providers: [MilestoneService],
  exports: [MilestoneService],
})
export class MilestoneModule {}
