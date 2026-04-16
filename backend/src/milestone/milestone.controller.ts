import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { MilestoneService } from './milestone.service';
import { CreateMilestoneDto } from './dto/create.milestone.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@Controller('projects')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestoneService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESEARCHER)
  @Post(':id/milestones')
  createMilestone(
    @Param('id') projectId: string,
    @Body() dto: CreateMilestoneDto,
    @Req() req: any,
  ) {
    return this.milestonesService.createMilestone(dto, projectId, req.user.sub);
  }

  @Get(':id/milestones')
  listMilestones(@Param('id') projectId: string) {
    return this.milestonesService.listProjectMilestones(projectId);
  }
}
