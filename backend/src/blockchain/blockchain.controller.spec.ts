import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';

describe('BlockchainController', () => {
  let controller: BlockchainController;
  let service: jest.Mocked<BlockchainService>;

  beforeEach(() => {
    service = {
      deployProjectContract: jest.fn(),
      releaseMilestone: jest.fn(),
      getOnchainProjectData: jest.fn(),
    } as unknown as jest.Mocked<BlockchainService>;

    controller = new BlockchainController(service);
  });

  it('encaminha deployContract para o service com projectId e userId', async () => {
    service.deployProjectContract.mockResolvedValue({
      contractAddress: '0xcontract',
      deploymentTxHash: '0xdeploy',
    });

    const req = { user: { sub: 'user-1' } };
    const result = await controller.deployContract('project-1', req);

    expect(service.deployProjectContract).toHaveBeenCalledWith(
      'project-1',
      'user-1',
    );
    expect(result).toEqual({
      contractAddress: '0xcontract',
      deploymentTxHash: '0xdeploy',
    });
  });

  it('encaminha releaseMilestone para o service com params e userId', async () => {
    service.releaseMilestone.mockResolvedValue({
      txHash: '0xrelease',
      blockNumber: 42,
    });

    const req = { user: { sub: 'user-1' } };
    const result = await controller.releaseMilestone('project-1', 'm1', req);

    expect(service.releaseMilestone).toHaveBeenCalledWith(
      'project-1',
      'm1',
      'user-1',
    );
    expect(result).toEqual({
      txHash: '0xrelease',
      blockNumber: 42,
    });
  });

  it('encaminha getOnchain para o service com projectId e userId', async () => {
    service.getOnchainProjectData.mockResolvedValue({
      contractAddress: '0xcontract',
      researcher: '0xresearcher',
      balanceWei: '10',
      balanceEth: '0.00000000000000001',
      milestones: [],
    });

    const req = { user: { sub: 'user-1' } };
    const result = await controller.getOnchain('project-1', req);

    expect(service.getOnchainProjectData).toHaveBeenCalledWith(
      'project-1',
      'user-1',
    );
    expect(result.contractAddress).toBe('0xcontract');
  });
});
