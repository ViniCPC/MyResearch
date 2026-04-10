import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDonationDto } from './dto/donation.create.dto';

@Injectable()
export class DonationsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly select = {
    id: true,
    projectId: true,
    donorId: true,
    amount: true,
    txHash: true,
    createdAt: true,
    donor: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  } as const;

  async registerDonation(
    dto: RegisterDonationDto,
    projectId: string,
    donorId: string,
  ) {
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

    const donationWithSameTxHash = await this.prisma.donation.findUnique({
      where: {
        txHash: dto.txHash,
      },
      select: {
        id: true,
      },
    });

    if (donationWithSameTxHash) {
      throw new BadRequestException('Essa transação já foi registrada');
    }

    const donation = await this.prisma.donation.create({
      data: {
        projectId,
        donorId,
        amount: dto.amount,
        txHash: dto.txHash,
      },
      select: this.select,
    });

    return donation;
  }

  async listProjectDonations(projectId: string) {
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

    const donations = await this.prisma.donation.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: this.select,
    });

    return donations;
  }
}