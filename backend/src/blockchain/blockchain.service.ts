import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, ContractFactory, JsonRpcProvider, Wallet, formatEther, parseEther } from 'ethers';
import { PrismaService } from 'src/prisma/prisma.service';

import escrowArtifact from './abi/ResearchProjectEscrow.json';

@Injectable()
export class BlockchainService {
  private readonly provider: JsonRpcProvider;
  private readonly wallet: Wallet;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL');
    const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');

    if (!rpcUrl) {
      throw new Error('BLOCKCHAIN_RPC_URL não definido');
    }

    if (!privateKey) {
      throw new Error('BLOCKCHAIN_PRIVATE_KEY não definido');
    }

    this.provider = new JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(privateKey, this.provider);
  }

  private getReadContract(contractAddress: string) {
    return new Contract(contractAddress, escrowArtifact.abi, this.provider);
  }

  private getWriteContract(contractAddress: string) {
    return new Contract(contractAddress, escrowArtifact.abi, this.wallet);
  }

  async deployProjectContract(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
        deletedAt: null,
      },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        owner: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    if (project.contractAddress) {
      throw new BadRequestException('Projeto já possui contrato');
    }

    if (!project.owner.walletAddress) {
      throw new BadRequestException('Pesquisador não possui walletAddress');
    }

    if (!project.milestones.length) {
      throw new BadRequestException('Projeto precisa ter milestones antes do deploy');
    }

    const factory = new ContractFactory(
      escrowArtifact.abi,
      escrowArtifact.bytecode,
      this.wallet,
    );

    const contract = await factory.deploy(project.owner.walletAddress);
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    for (let index = 0; index < project.milestones.length; index++) {
      const milestone = project.milestones[index];

      const tx = await contract.addMilestone(
        milestone.title,
        parseEther(String(milestone.amount)),
      );

      await tx.wait();

      await this.prisma.milestone.update({
        where: { id: milestone.id },
        data: {
          onChainIndex: index,
        },
      });
    }

    await this.prisma.project.update({
      where: { id: project.id },
      data: {
        contractAddress,
      },
    });

    return {
      contractAddress,
      deploymentTxHash: contract.deploymentTransaction()?.hash ?? null,
    };
  }

  async releaseMilestone(projectId: string, milestoneId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
        deletedAt: null,
      },
      include: {
        milestones: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    if (!project.contractAddress) {
      throw new BadRequestException('Projeto ainda não possui contrato');
    }

    const milestone = project.milestones.find((m) => m.id === milestoneId);

    if (!milestone) {
      throw new NotFoundException('Milestone não encontrada');
    }

    if (milestone.onChainIndex === null || milestone.onChainIndex === undefined) {
      throw new BadRequestException('Milestone sem índice on-chain');
    }

    if (milestone.releaseTxHash) {
      throw new BadRequestException('Milestone já foi liberada');
    }

    const contract = this.getWriteContract(project.contractAddress);

    const tx = await contract.releaseMilestone(milestone.onChainIndex);
    const receipt = await tx.wait();

    await this.prisma.milestone.update({
      where: { id: milestone.id },
      data: {
        releaseTxHash: tx.hash,
        releasedAt: new Date(),
      },
    });

    return {
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
    };
  }

  async getOnchainProjectData(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    if (!project.contractAddress) {
      throw new BadRequestException('Projeto ainda não possui contrato');
    }

    const code = await this.provider.getCode(project.contractAddress);

    if (code === '0x') {
      throw new BadRequestException('Nenhum contrato encontrado nesse endereço');
    }

    const balanceWei = await this.provider.getBalance(project.contractAddress);
    const contract = this.getReadContract(project.contractAddress);

    const researcher = await contract.researcher();
    const milestones = await contract.getMilestones();

    return {
      contractAddress: project.contractAddress,
      researcher,
      balanceWei: balanceWei.toString(),
      balanceEth: formatEther(balanceWei),
      milestones,
    };
  }
}