import { NotFoundException } from '@nestjs/common';
import { ProjectStatus, Role } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectsService } from './projects.service';

describe('ProjectsService (Researcher)', () => {
  let prisma: PrismaService;
  let service: ProjectsService;

  const userId = 'user-1';
  const otherUserId = 'user-2';

  beforeEach(async () => {
    prisma = new PrismaService();
    service = new ProjectsService(prisma);

    await prisma.donation.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
      data: {
        id: userId,
        name: 'Researcher',
        email: 'researcher@test.com',
        passwordHash: 'hash',
        role: Role.RESEARCHER,
      },
    });

    await prisma.user.create({
      data: {
        id: otherUserId,
        name: 'Other',
        email: 'other@test.com',
        passwordHash: 'hash',
        role: Role.RESEARCHER,
      },
    });
  });

  it('cria um projeto com sucesso', async () => {
    const dto = {
      title: 'Projeto A',
      description: 'Descricao A',
      goalAmount: 1000,
      status: ProjectStatus.DRAFT,
    };

    const created = await service.createProject(dto, userId);

    expect(created.id).toBeDefined();
    expect(created.title).toBe(dto.title);
    expect(created.goalAmount).toBe(dto.goalAmount);
  });

  it('lista projetos do pesquisador com paginação e ordenação', async () => {
    await prisma.project.create({
      data: {
        title: 'Projeto A',
        description: 'Descricao A',
        goalAmount: 100,
        ownerId: userId,
        status: ProjectStatus.DRAFT,
      },
    });
    await prisma.project.create({
      data: {
        title: 'Projeto B',
        description: 'Descricao B',
        goalAmount: 200,
        ownerId: userId,
        status: ProjectStatus.ACTIVE,
      },
    });
    await prisma.project.create({
      data: {
        title: 'Projeto C',
        description: 'Descricao C',
        goalAmount: 300,
        ownerId: userId,
        status: ProjectStatus.DRAFT,
      },
    });
    await prisma.project.create({
      data: {
        title: 'Projeto D',
        description: 'Outro',
        goalAmount: 400,
        ownerId: otherUserId,
        status: ProjectStatus.DRAFT,
      },
    });

    const result = await service.getAllProjects(
      {
        page: 1,
        pageSize: 2,
        sortBy: 'title',
        order: 'asc',
      },
      userId,
    );

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(3);
    expect(result.meta.totalPages).toBe(2);
    expect(result.data[0].title).toBe('Projeto A');
    expect(result.data[1].title).toBe('Projeto B');
  });

  it('busca projeto por id para o dono', async () => {
    const project = await prisma.project.create({
      data: {
        title: 'Projeto X',
        description: 'Descricao X',
        goalAmount: 500,
        ownerId: userId,
        status: ProjectStatus.DRAFT,
      },
    });

    const found = await service.projectById(project.id, userId);

    expect(found.id).toBe(project.id);
  });

  it('retorna erro quando projeto não pertence ao usuário', async () => {
    const project = await prisma.project.create({
      data: {
        title: 'Projeto Y',
        description: 'Descricao Y',
        goalAmount: 500,
        ownerId: otherUserId,
        status: ProjectStatus.DRAFT,
      },
    });

    await expect(service.projectById(project.id, userId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('atualiza projeto existente', async () => {
    const project = await prisma.project.create({
      data: {
        title: 'Projeto Z',
        description: 'Descricao Z',
        goalAmount: 500,
        ownerId: userId,
        status: ProjectStatus.DRAFT,
      },
    });

    const updated = await service.updateProject(
      project.id,
      { title: 'Projeto Z Atualizado' },
      userId,
    );

    expect(updated.title).toBe('Projeto Z Atualizado');
  });

  it('não atualiza projeto de outro usuário', async () => {
    const project = await prisma.project.create({
      data: {
        title: 'Projeto W',
        description: 'Descricao W',
        goalAmount: 500,
        ownerId: otherUserId,
        status: ProjectStatus.DRAFT,
      },
    });

    await expect(
      service.updateProject(project.id, { title: 'Novo' }, userId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove projeto e impede novas leituras', async () => {
    const project = await prisma.project.create({
      data: {
        title: 'Projeto Remover',
        description: 'Descricao',
        goalAmount: 500,
        ownerId: userId,
        status: ProjectStatus.DRAFT,
      },
    });

    await service.removeProject(project.id, userId);

    await expect(service.projectById(project.id, userId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
