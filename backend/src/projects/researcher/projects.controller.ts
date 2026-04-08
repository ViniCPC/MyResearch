import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from 'src/auth/dto/dto.projects/dto.projects.create';
import { UpdateProjectDto } from 'src/auth/dto/dto.projects/dto.project.update';
import { QueryProjectDto } from 'src/auth/dto/dto.projects/dto.query.project';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.RESEARCHER)
@Controller('researcher/projects')
export class ResearcherProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Body() dto: CreateProjectDto, @Req() req: any) {
    return this.projectsService.createProject(dto, req.user.sub);
  }

  @Get()
  getAllProjects(@Query() query: QueryProjectDto, @Req() req: any) {
    return this.projectsService.getAllProjects(query, req.user.sub);
  }

  @Get(':id')
  projectById(@Param('id') id: string, @Req() req: any) {
    return this.projectsService.projectById(id, req.user.sub);
  }

  @Patch(':id')
  updateProject(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: any,
  ) {
    return this.projectsService.updateProject(id, dto, req.user.sub);
  }

  @Delete(':id')
  removeProject(@Param('id') id: string, @Req() req: any) {
    return this.projectsService.removeProject(id, req.user.sub);
  }
}