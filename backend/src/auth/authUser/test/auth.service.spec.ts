import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let prisma: PrismaService;
  let jwtService: JwtService;
  let service: AuthService;

  beforeEach(async () => {
    prisma = new PrismaService();
    jwtService = new JwtService({ secret: 'test-secret' });
    service = new AuthService(prisma, jwtService);

    await prisma.donation.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  it('registra um doador com sucesso', async () => {
    const dto = {
      name: 'Joana',
      email: 'joana@test.com',
      password: 'senha123',
    };

    const created = await service.registerUser(dto);

    expect(created.email).toBe(dto.email);
    expect(created.role).toBe(Role.DONOR);

    const stored = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    expect(stored).toBeTruthy();
    expect(stored?.passwordHash).not.toBe(dto.password);
  });

  it('não permite cadastro com email existente', async () => {
    await prisma.user.create({
      data: {
        name: 'Teste',
        email: 'duplicado@test.com',
        passwordHash: 'hash',
        role: Role.DONOR,
      },
    });

    await expect(
      service.registerUser({
        name: 'Outro',
        email: 'duplicado@test.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('faz login e retorna token', async () => {
    const password = 'segredo';
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: 'Login',
        email: 'login@test.com',
        passwordHash,
        role: Role.DONOR,
      },
    });

    const result = await service.login({
      email: 'login@test.com',
      password,
    });

    expect(result.access_token).toBeDefined();
    expect(result.user.id).toBe(user.id);
    expect(result.user.email).toBe(user.email);
  });

  it('nega login quando email não existe', async () => {
    await expect(
      service.login({ email: 'inexistente@test.com', password: '123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('nega login quando senha está incorreta', async () => {
    const passwordHash = await bcrypt.hash('correta', 10);
    await prisma.user.create({
      data: {
        name: 'Senha',
        email: 'senha@test.com',
        passwordHash,
        role: Role.DONOR,
      },
    });

    await expect(
      service.login({ email: 'senha@test.com', password: 'errada' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('retorna perfil no me', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Perfil',
        email: 'perfil@test.com',
        passwordHash: 'hash',
        role: Role.DONOR,
        institutionName: 'Instituto X',
      },
    });

    const me = await service.me(user.id);

    expect(me).toMatchObject({
      id: user.id,
      email: user.email,
      role: user.role,
      institutionName: user.institutionName,
    });
  });
});
