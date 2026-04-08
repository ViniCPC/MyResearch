import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMilestoneDto } from './dto/create.milestone.dto';

@Injectable()
export class MilestoneService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly select = {
    id: true,
    projectId: true,
    title: true,
    description: true,
    amount: true,
    order: true,
    released: true,
    txHash: true,
    createdAt: true,
  } as const;

  async createMilestone(
    dto: CreateMilestoneDto,
    projectId: string,
    userId: string,
  ) {
    const projectExists = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        goalAmount: true,
      },
    });

    if (!projectExists) {
      throw new NotFoundException(
        'Projeto não encontrado ou não pertence ao usuário',
      );
    }

    const totalAmount = await this.prisma.milestone.aggregate({
      where: {
        projectId,
      },
      _sum: {
        amount: true,
      },
    });

    const currentTotal = Number(totalAmount._sum.amount ?? 0);
    const newTotal = currentTotal + dto.amount;
    const goalAmount = Number(projectExists.goalAmount);

    if (newTotal > goalAmount) {
      throw new BadRequestException(
        'A soma das milestones não pode ultrapassar a meta do projeto',
      );
    }

    const lastMilestone = await this.prisma.milestone.findFirst({
      where: {
        projectId,
      },
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    });

    const nextOrder = lastMilestone ? lastMilestone.order + 1 : 1;

    const milestone = await this.prisma.milestone.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        order: nextOrder,
      },
      select: this.select,
    });

    return milestone;
  }

  async listProjectMilestones(projectId: string) {
  const projectExists = await this.prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!projectExists) {
    throw new NotFoundException('Projeto não encontrado');
  }

  const milestones = await this.prisma.milestone.findMany({
    where: {
      projectId,
    },
    orderBy: {
      order: 'asc',
    },
    select: this.select,
  });

  return milestones;
}
}