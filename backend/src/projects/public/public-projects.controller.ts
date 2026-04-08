import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProjectsServicePublic } from './public-projects.service'; 
import { QueryProjectDto } from 'src/auth/dto/dto.projects/dto.query.project';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsServicePublic) {}

  @Get()
  getPublicProjects(@Query() query: QueryProjectDto) {
    return this.projectsService.getPublicProjects(query);
  }

  @Get(':id')
  getPublicProjectById(@Param('id') id: string) {
    return this.projectsService.getPublicProjectById(id);
  }
}