import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from 'src/auth/dto/dto.projects/dto.projects.create'; 
import { QueryProjectDto } from 'src/auth/dto/dto.projects/dto.query.project'; 
import { UpdateProjectDto } from 'src/auth/dto/dto.projects/dto.project.update';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createProject(dto: CreateProjectDto, userId: string) {
    try {
      const project = await this.prisma.project.create({
        data: {
          ...dto,
          ownerId: userId,
        },
        select: this.select,
      });

      return project;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Erro ao tentar criar um novo projeto');
    }
  }

  async getAllProjects(query: QueryProjectDto, userId: string) {
    try {
      const { search, status, page, pageSize, sortBy, order } = query;
      const skip = (page - 1) * pageSize;

      const where = {
        ownerId: userId,
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
          totalPages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Erro ao buscar os projetos');
    }
  }

  async projectById(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        ownerId: userId,
        deletedAt: null,
      },
      select: this.select,
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    return project;
  }

  async updateProject(id: string, dto: UpdateProjectDto, userId: string) {
    const projectExists = await this.prisma.project.findFirst({
      where: {
        id,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!projectExists) {
      throw new NotFoundException('Projeto não encontrado');
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: dto,
      select: this.select,
    });

    return project;
  }

  async removeProject(id: string, userId: string) {
    const projectExists = await this.prisma.project.findFirst({
      where: {
        id,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!projectExists) {
      throw new NotFoundException('Projeto não encontrado');
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: this.select,
    });

    return project;
  }
}