import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { api } from './api';
import { login, registerResearcher } from './auth.service';

const mock = new MockAdapter(api);

beforeEach(() => mock.reset());
afterEach(() => mock.reset());

describe('login', () => {
  it('retorna accessToken quando credenciais são válidas', async () => {
    mock.onPost('/auth/login').reply(200, { access_token: 'token-jwt-123' });

    const result = await login({ email: 'test@test.com', password: '123456' });

    expect(result.accessToken).toBe('token-jwt-123');
  });

  it('converte access_token (snake_case) para accessToken (camelCase)', async () => {
    mock.onPost('/auth/login').reply(200, { access_token: 'meu-token' });

    const result = await login({ email: 'a@b.com', password: 'senha123' });

    expect(result).toHaveProperty('accessToken');
    expect(result).not.toHaveProperty('access_token');
  });

  it('envia email e password no body da requisição', async () => {
    mock.onPost('/auth/login').reply((config) => {
      const body = JSON.parse(config.data);
      expect(body.email).toBe('user@email.com');
      expect(body.password).toBe('minhasenha');
      return [200, { access_token: 'tk' }];
    });

    await login({ email: 'user@email.com', password: 'minhasenha' });
  });

  it('lança erro quando credenciais são inválidas (401)', async () => {
    mock.onPost('/auth/login').reply(401, { message: 'Credenciais inválidas' });

    await expect(login({ email: 'x@x.com', password: 'errada' })).rejects.toThrow();
  });
});

describe('registerResearcher', () => {
  it('retorna dados do pesquisador cadastrado com sucesso', async () => {
    const novoUsuario = { id: 1, name: 'João', email: 'joao@uni.com', institution: 'USP' };
    mock.onPost('/auth/researcher/register').reply(201, novoUsuario);

    const result = await registerResearcher({
      name: 'João',
      email: 'joao@uni.com',
      password: '123456',
      institution: 'USP',
    });

    expect(result).toMatchObject({ name: 'João', email: 'joao@uni.com' });
  });

  it('envia todos os campos obrigatórios (name, email, password, institution)', async () => {
    mock.onPost('/auth/researcher/register').reply((config) => {
      const body = JSON.parse(config.data);
      expect(body).toHaveProperty('name');
      expect(body).toHaveProperty('email');
      expect(body).toHaveProperty('password');
      expect(body).toHaveProperty('institution');
      return [201, {}];
    });

    await registerResearcher({
      name: 'Ana',
      email: 'ana@uni.com',
      password: 'senha123',
      institution: 'UNICAMP',
    });
  });

  it('chama o endpoint correto /auth/researcher/register', async () => {
    mock.onPost('/auth/researcher/register').reply(201, {});

    await registerResearcher({
      name: 'Test',
      email: 't@t.com',
      password: '123456',
      institution: 'UFMG',
    });

    expect(mock.history.post[0].url).toBe('/auth/researcher/register');
  });

  it('lança erro quando email já está em uso (400)', async () => {
    mock.onPost('/auth/researcher/register').reply(400, { message: 'Email já cadastrado' });

    await expect(
      registerResearcher({ name: 'X', email: 'x@x.com', password: '123456', institution: 'X' })
    ).rejects.toThrow();
  });
});
