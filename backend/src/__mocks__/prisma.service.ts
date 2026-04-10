export const PrismaService = jest.fn().mockImplementation(() => ({
  donation: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    deleteMany: jest.fn(),
  },
  project: {
    findFirst: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  user: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  milestone: {
    deleteMany: jest.fn(),
  },
}));