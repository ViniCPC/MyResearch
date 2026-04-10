import { INestApplication, ValidationPipe } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';

import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, ProjectStatus } from 'generated/prisma/enums';

describe('Donations E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let donorToken: string;
  let researcherToken: string;

  let donorId: string;
  let researcherId: string;

  let projectId: string;
  let emptyProjectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
  });

  beforeEach(async () => {
    // limpa tabelas na ordem correta
    await prisma.donation.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // cria um doador
    const donor = await prisma.user.create({
      data: {
        name: 'Doador Teste',
        email: 'doador@test.com',
        passwordHash: 'hash-teste',
        role: Role.DONOR,
      },
    });

    // cria um pesquisador dono do projeto
    const researcher = await prisma.user.create({
      data: {
        name: 'Pesquisador Teste',
        email: 'pesquisador@test.com',
        passwordHash: 'hash-teste',
        role: Role.RESEARCHER,
      },
    });

    donorId = donor.id;
    researcherId = researcher.id;

    donorToken = jwtService.sign({
      sub: donor.id,
      email: donor.email,
      role: donor.role,
    });

    researcherToken = jwtService.sign({
      sub: researcher.id,
      email: researcher.email,
      role: researcher.role,
    });

    // projeto que vai receber doações
    const project = await prisma.project.create({
      data: {
        title: 'Projeto Teste',
        description: 'Descrição do projeto teste',
        goalAmount: 1000,
        ownerId: researcher.id,
        status: ProjectStatus.DRAFT,
      },
    });

    // projeto vazio para testar GET sem doações
    const emptyProject = await prisma.project.create({
      data: {
        title: 'Projeto Vazio',
        description: 'Projeto sem doações',
        goalAmount: 500,
        ownerId: researcher.id,
        status: ProjectStatus.DRAFT,
      },
    });

    projectId = project.id;
    emptyProjectId = emptyProject.id;
  });

  afterAll(async () => {
    await prisma.donation.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    await app.close();
  });

  describe('POST /projects/:id/donations/register', () => {
    it('deve registrar uma doação válida', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/donations/register`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          amount: 150,
          txHash: '0xhashvalida123456',
        });

      expect(response.status).toBe(201);
      expect(response.body.projectId).toBe(projectId);
      expect(response.body.donorId).toBe(donorId);
      expect(response.body.txHash).toBe('0xhashvalida123456');
      expect(Number(response.body.amount)).toBe(150);
    });

    it('não deve registrar doação com txHash repetido', async () => {
      await prisma.donation.create({
        data: {
          projectId,
          donorId,
          amount: 100,
          txHash: '0xhashrepetida123',
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/donations/register`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          amount: 200,
          txHash: '0xhashrepetida123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'Essa transação já foi registrada',
      );
    });

    it('não deve registrar doação em projeto inexistente', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/id-inexistente/donations/register`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          amount: 100,
          txHash: '0xhashinexistente123',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Projeto não encontrado');
    });

    it('não deve registrar doação sem login', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/donations/register`)
        .send({
          amount: 100,
          txHash: '0xhashsemlogin123',
        });

      expect(response.status).toBe(401);
    });

    it('deve permitir doação com usuário autenticado que não é DONOR', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/donations/register`)
        .set('Authorization', `Bearer ${researcherToken}`)
        .send({
          amount: 100,
          txHash: '0xhashrole123456',
        });

      expect(response.status).toBe(201);
      expect(response.body.projectId).toBe(projectId);
      expect(response.body.donorId).toBe(researcherId);
      expect(response.body.txHash).toBe('0xhashrole123456');
      expect(Number(response.body.amount)).toBe(100);
    });
  });

  describe('GET /projects/:id/donations', () => {
    it('deve listar doações de um projeto existente', async () => {
      await prisma.donation.create({
        data: {
          projectId,
          donorId,
          amount: 50,
          txHash: '0xhashlista1',
        },
      });

      await prisma.donation.create({
        data: {
          projectId,
          donorId,
          amount: 75,
          txHash: '0xhashlista2',
        },
      });

      const response = await request(app.getHttpServer()).get(
        `/projects/${projectId}/donations`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].projectId).toBe(projectId);
    });

    it('deve retornar lista vazia para projeto sem doações', async () => {
      const response = await request(app.getHttpServer()).get(
        `/projects/${emptyProjectId}/donations`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('deve retornar 404 ao listar doações de projeto inexistente', async () => {
      const response = await request(app.getHttpServer()).get(
        `/projects/id-inexistente/donations`,
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Projeto não encontrado');
    });
  });
});
