import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  ContractFactory,
  JsonRpcProvider,
  Wallet,
  formatEther,
  parseEther,
} from 'ethers';
import { BlockchainService } from './blockchain.service';

const mockProvider = {
  getCode: jest.fn(),
  getBalance: jest.fn(),
};

const mockWallet = { kind: 'wallet' };

const mockReadContract = {
  researcher: jest.fn(),
  getMilestones: jest.fn(),
};

const mockWriteContract = {
  addMilestone: jest.fn(),
  releaseMilestone: jest.fn(),
};

const mockDeployment = {
  waitForDeployment: jest.fn(),
  getAddress: jest.fn(),
  deploymentTransaction: jest.fn(),
};

const mockContractFactory = {
  deploy: jest.fn(),
};

jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn(() => mockProvider),
  Wallet: jest.fn(() => mockWallet),
  ContractFactory: jest.fn(() => mockContractFactory),
  Contract: jest.fn((_: string, __: unknown, runner: unknown) => {
    if (runner === mockProvider) {
      return mockReadContract;
    }
    return mockWriteContract;
  }),
  parseEther: jest.fn((value: string) => `wei:${value}`),
  formatEther: jest.fn((value: bigint) => `eth:${value.toString()}`),
}));

describe('BlockchainService', () => {
  const originalEnv = process.env;

  let service: BlockchainService;
  let prisma: {
    project: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    milestone: {
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      BLOCKCHAIN_RPC_URL: 'http://localhost:8545',
      BLOCKCHAIN_PRIVATE_KEY:
        '0x0123456789012345678901234567890123456789012345678901234567890123',
    };

    prisma = {
      project: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      milestone: {
        update: jest.fn(),
      },
    };

    mockDeployment.waitForDeployment.mockResolvedValue(undefined);
    mockDeployment.getAddress.mockResolvedValue('0xcontract');
    mockDeployment.deploymentTransaction.mockReturnValue({ hash: '0xdeploy' });
    mockContractFactory.deploy.mockResolvedValue(mockDeployment);

    mockWriteContract.addMilestone.mockImplementation(async () => ({
      wait: jest.fn().mockResolvedValue(undefined),
    }));

    mockWriteContract.releaseMilestone.mockResolvedValue({
      hash: '0xrelease',
      wait: jest.fn().mockResolvedValue({ blockNumber: 999 }),
    });

    mockProvider.getCode.mockResolvedValue('0x1234');
    mockProvider.getBalance.mockResolvedValue(1500000000000000000n);
    mockReadContract.researcher.mockResolvedValue('0xresearcher');
    mockReadContract.getMilestones.mockResolvedValue([
      { title: 'M1', amount: 100n, released: false },
    ]);

    service = new BlockchainService(prisma as any);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('deployProjectContract', () => {
    it('faz deploy, cadastra milestones onchain e salva contractAddress', async () => {
      prisma.project.findFirst.mockResolvedValue({
        id: 'project-1',
        contractAddress: null,
        owner: { walletAddress: '0xowner' },
        milestones: [
          { id: 'm1', title: 'Marco 1', amount: 1 },
          { id: 'm2', title: 'Marco 2', amount: 2 },
        ],
      });

      const result = await service.deployProjectContract('project-1', 'user-1');

      expect(prisma.project.findFirst).toHaveBeenCalled();
      expect(ContractFactory).toHaveBeenCalled();
      expect(mockContractFactory.deploy).toHaveBeenCalledWith('0xowner');
      expect(mockWriteContract.addMilestone).toHaveBeenCalledTimes(2);
      expect(parseEther).toHaveBeenNthCalledWith(1, '1');
      expect(parseEther).toHaveBeenNthCalledWith(2, '2');
      expect(prisma.milestone.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'm1' },
        data: { onChainIndex: 0 },
      });
      expect(prisma.milestone.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'm2' },
        data: { onChainIndex: 1 },
      });
      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-1' },
        data: { contractAddress: '0xcontract' },
      });
      expect(result).toEqual({
        contractAddress: '0xcontract',
        deploymentTxHash: '0xdeploy',
      });
    });

    it('retorna erro quando projeto não existe', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.deployProjectContract('project-1', 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('retorna erro quando não há milestones', async () => {
      prisma.project.findFirst.mockResolvedValue({
        id: 'project-1',
        contractAddress: null,
        owner: { walletAddress: '0xowner' },
        milestones: [],
      });

      await expect(
        service.deployProjectContract('project-1', 'user-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('retorna erro quando blockchain não está configurada', async () => {
      delete process.env.BLOCKCHAIN_RPC_URL;
      delete process.env.BLOCKCHAIN_PRIVATE_KEY;
      service = new BlockchainService(prisma as any);

      prisma.project.findFirst.mockResolvedValue({
        id: 'project-1',
        contractAddress: null,
        owner: { walletAddress: '0xowner' },
        milestones: [{ id: 'm1', title: 'Marco 1', amount: 1 }],
      });

      await expect(
        service.deployProjectContract('project-1', 'user-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('releaseMilestone', () => {
    it('libera milestone no contrato e salva txHash local', async () => {
      prisma.project.findFirst.mockResolvedValue({
        id: 'project-1',
        contractAddress: '0xcontract',
        milestones: [
          {
            id: 'm1',
            onChainIndex: 0,
            releaseTxHash: null,
          },
        ],
      });

      const result = await service.releaseMilestone('project-1', 'm1', 'user-1');

      expect(mockWriteContract.releaseMilestone).toHaveBeenCalledWith(0);
      expect(prisma.milestone.update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: {
          releaseTxHash: '0xrelease',
          releasedAt: expect.any(Date),
          released: true,
        },
      });
      expect(result).toEqual({ txHash: '0xrelease', blockNumber: 999 });
    });

    it('retorna erro quando milestone já foi liberada', async () => {
      prisma.project.findFirst.mockResolvedValue({
        id: 'project-1',
        contractAddress: '0xcontract',
        milestones: [
          {
            id: 'm1',
            onChainIndex: 0,
            releaseTxHash: '0xold',
          },
        ],
      });

      await expect(
        service.releaseMilestone('project-1', 'm1', 'user-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('getOnchainProjectData', () => {
    it('retorna dados onchain do projeto', async () => {
      prisma.project.findFirst.mockResolvedValue({
        id: 'project-1',
        contractAddress: '0xcontract',
      });

      const result = await service.getOnchainProjectData('project-1', 'user-1');

      expect(JsonRpcProvider).toHaveBeenCalled();
      expect(Wallet).toHaveBeenCalled();
      expect(mockProvider.getCode).toHaveBeenCalledWith('0xcontract');
      expect(mockProvider.getBalance).toHaveBeenCalledWith('0xcontract');
      expect(formatEther).toHaveBeenCalledWith(1500000000000000000n);
      expect(result).toEqual({
        contractAddress: '0xcontract',
        researcher: '0xresearcher',
        balanceWei: '1500000000000000000',
        balanceEth: 'eth:1500000000000000000',
        milestones: [{ title: 'M1', amount: 100n, released: false }],
      });
    });

    it('retorna erro quando não há bytecode no endereço', async () => {
      prisma.project.findFirst.mockResolvedValue({
        id: 'project-1',
        contractAddress: '0xcontract',
      });
      mockProvider.getCode.mockResolvedValue('0x');

      await expect(
        service.getOnchainProjectData('project-1', 'user-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
