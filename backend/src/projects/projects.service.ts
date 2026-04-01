import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateProjectDto } from "src/auth/dto/dto.projects/dto.projects.create";
import { QueryProjectDto } from "src/auth/dto/dto.projects/dto.query.project";
import { PrismaService } from "src/prisma/prisma.service";

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

  async createProjects(dto: CreateProjectDto, userId: string) {
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
      throw new InternalServerErrorException(
        'Erro ao tentar criar um novo projeto',
      );
    }
  }

}

