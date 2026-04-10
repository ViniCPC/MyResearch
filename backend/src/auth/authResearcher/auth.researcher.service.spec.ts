import { BadRequestException } from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthResearcher } from './auth.researcher.service';

describe('AuthResearcher', () => {
  let prisma: PrismaService;
  let service: AuthResearcher;

  beforeEach(async () => {
    prisma = new PrismaService();
    service = new AuthResearcher(prisma);

    await prisma.donation.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  it('registra pesquisador com sucesso', async () => {
    const dto = {
      name: 'Pesquisador',
      email: 'pesquisador@test.com',
      password: 'senha123',
      institution: 'Universidade Teste',
    };

    const created = await service.registerResearcher(dto);

    expect(created.email).toBe(dto.email);
    expect(created.role).toBe(Role.RESEARCHER);
    expect(created.institutionName).toBe(dto.institution);
  });

  it('não permite cadastro com email existente', async () => {
    await prisma.user.create({
      data: {
        name: 'Existente',
        email: 'existente@test.com',
        passwordHash: 'hash',
        role: Role.RESEARCHER,
      },
    });

    await expect(
      service.registerResearcher({
        name: 'Outro',
        email: 'existente@test.com',
        password: '123456',
        institution: 'Instituto',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
