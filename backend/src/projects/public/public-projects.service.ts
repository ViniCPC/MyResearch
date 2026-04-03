import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { QueryProjectDto } from "src/auth/dto/dto.projects/dto.query.project";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class ProjectsServicePublic {
    constructor(private readonly prisma: PrismaService) { }

    private readonly select = {
        id: true,
        title: true,
        description: true,
        goalAmount: true,
        imageUrl: true,
        contractAddress: true,
        status: true,
        createdAt: true,
        updatedAt: true,
    } as const;


    async getPublicProjects(query: QueryProjectDto) {
        const {search, status, page, pageSize, sortBy, order} = query;
        const skip = (page - 1) * pageSize;

         const where = {
        deletedAt: null,
        ...(status && { status }),
        ...(search && {
          OR: [
            {
              title: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              description: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }),
      };

     const [projects, total] = await this.prisma.$transaction([
        this.prisma.project.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: {
            [sortBy]: order,
          },
          select: this.select,
        }),
        this.prisma.project.count({ where }),
      ]);

      return {
        data: projects,
        meta: {
            total,
            page, 
            pageSize,
            totalPages: Math.ceil(total/ pageSize) 
        }
      }
    }
    async getPublicProjectById(id: string) {
        const projectsExists = await this.prisma.project.findFirst({
            where: { id, deletedAt: null },
            select: this.select
        });

        if (!projectsExists) {
            throw new NotFoundException('Projeto não encontrado');
        };

        return projectsExists;
    }

}