import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProjectStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { MilestoneService } from './milestone.service';

describe('MilestoneService', () => {
  let prisma: PrismaService;
  let service: MilestoneService;

  const ownerId = 'owner-1';
  const otherId = 'owner-2';

  beforeEach(async () => {
    prisma = new PrismaService();
    service = new MilestoneService(prisma);

    await prisma.donation.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  const createProject = async (data?: Partial<{ ownerId: string; goalAmount: number }>) => {
    return prisma.project.create({
      data: {
        title: 'Projeto',
        description: 'Descricao',
        goalAmount: data?.goalAmount ?? 100,
        ownerId: data?.ownerId ?? ownerId,
        status: ProjectStatus.DRAFT,
      },
    });
  };

  it('cria milestones respeitando a ordem', async () => {
    const project = await createProject({ goalAmount: 200 });

    const first = await service.createMilestone(
      { title: 'M1', description: 'Desc', amount: 40 },
      project.id,
      ownerId,
    );
    const second = await service.createMilestone(
      { title: 'M2', description: 'Desc', amount: 50 },
      project.id,
      ownerId,
    );

    expect(first.order).toBe(1);
    expect(second.order).toBe(2);
  });

  it('impede criar milestone quando soma ultrapassa a meta', async () => {
    const project = await createProject({ goalAmount: 60 });

    await service.createMilestone(
      { title: 'M1', description: 'Desc', amount: 50 },
      project.id,
      ownerId,
    );

    await expect(
      service.createMilestone(
        { title: 'M2', description: 'Desc', amount: 20 },
        project.id,
        ownerId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('retorna erro quando projeto não pertence ao usuário', async () => {
    const project = await createProject({ ownerId: otherId });

    await expect(
      service.createMilestone(
        { title: 'M1', description: 'Desc', amount: 10 },
        project.id,
        ownerId,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lista milestones em ordem ascendente', async () => {
    const project = await createProject({ goalAmount: 200 });

    await service.createMilestone(
      { title: 'M1', description: 'Desc', amount: 40 },
      project.id,
      ownerId,
    );
    await service.createMilestone(
      { title: 'M2', description: 'Desc', amount: 50 },
      project.id,
      ownerId,
    );

    const milestones = await service.listProjectMilestones(project.id);

    expect(milestones).toHaveLength(2);
    expect(milestones[0].order).toBe(1);
    expect(milestones[1].order).toBe(2);
  });

  it('retorna 404 ao listar milestones de projeto inexistente', async () => {
    await expect(service.listProjectMilestones('nao-existe')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
