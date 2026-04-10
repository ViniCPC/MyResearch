import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DonationsService } from './donation.service';
import { RegisterDonationDto } from './dto/donation.create.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('projects')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/donations/register')
  registerDonation(
    @Param('id') projectId: string,
    @Body() dto: RegisterDonationDto,
    @Req() req: any,
  ) {
    return this.donationsService.registerDonation(dto, projectId, req.user.sub);
  }

  @Get(':id/donations')
  listProjectDonations(@Param('id') projectId: string) {
    return this.donationsService.listProjectDonations(projectId);
  }
}
