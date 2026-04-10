import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donation.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [DonationsController],
  providers: [DonationsService],
})
export class DonationsModule {}