import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.RESEARCHER)
@Controller('projects')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post(':id/deploy-contract')
  deployContract(@Param('id') projectId: string, @Req() req: any) {
    return this.blockchainService.deployProjectContract(projectId, req.user.sub);
  }

  @Post(':id/milestones/:milestoneId/release')
  releaseMilestone(
    @Param('id') projectId: string,
    @Param('milestoneId') milestoneId: string,
    @Req() req: any,
  ) {
    return this.blockchainService.releaseMilestone(
      projectId,
      milestoneId,
      req.user.sub,
    );
  }

  @Get(':id/onchain')
  getOnchain(@Param('id') projectId: string, @Req() req: any) {
    return this.blockchainService.getOnchainProjectData(projectId, req.user.sub);
  }
}