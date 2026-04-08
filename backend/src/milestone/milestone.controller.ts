import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { MilestoneService } from "./milestone.service";
import { CreateMilestoneDto } from "./dto/create.milestone.dto";


@Controller('milestones')
export class MilestonesController {

    constructor(private readonly milestonesService: MilestoneService) { }

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