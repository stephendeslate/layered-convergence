import { BadRequestException } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';

const mockPrisma = {
  syncRun: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('SyncRunService', () => {
  let service: SyncRunService;

  beforeEach(() => {
    service = new SyncRunService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a sync run with pending status', async () => {
      mockPrisma.syncRun.create.mockResolvedValue({ id: '1', status: 'pending' });
      const result = await service.create({ dataSourceId: 'ds1' });
      expect(result.status).toBe('pending');
      expect(mockPrisma.syncRun.create).toHaveBeenCalledWith({
        data: { dataSourceId: 'ds1', status: 'pending' },
      });
    });
  });

  describe('findAll', () => {
    it('should return sync runs ordered by createdAt desc', async () => {
      mockPrisma.syncRun.findMany.mockResolvedValue([]);
      await service.findAll();
      expect(mockPrisma.syncRun.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by dataSourceId', async () => {
      mockPrisma.syncRun.findMany.mockResolvedValue([]);
      await service.findAll('ds1');
      expect(mockPrisma.syncRun.findMany).toHaveBeenCalledWith({
        where: { dataSourceId: 'ds1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should find a sync run by id', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1' });
      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });
  });

  describe('updateStatus', () => {
    it('should transition pending -> running', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1', status: 'pending' });
      mockPrisma.syncRun.update.mockResolvedValue({ id: '1', status: 'running' });
      const result = await service.updateStatus('1', { status: 'running' });
      expect(result.status).toBe('running');
    });

    it('should set startedAt when transitioning to running', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1', status: 'pending' });
      mockPrisma.syncRun.update.mockResolvedValue({ id: '1', status: 'running' });
      await service.updateStatus('1', { status: 'running' });
      const updateCall = mockPrisma.syncRun.update.mock.calls[0][0];
      expect(updateCall.data.startedAt).toBeInstanceOf(Date);
    });

    it('should transition running -> completed', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1', status: 'running' });
      mockPrisma.syncRun.update.mockResolvedValue({ id: '1', status: 'completed' });
      const result = await service.updateStatus('1', { status: 'completed', rowsIngested: 100 });
      expect(result.status).toBe('completed');
    });

    it('should set completedAt when transitioning to completed', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1', status: 'running' });
      mockPrisma.syncRun.update.mockResolvedValue({ id: '1', status: 'completed' });
      await service.updateStatus('1', { status: 'completed' });
      const updateCall = mockPrisma.syncRun.update.mock.calls[0][0];
      expect(updateCall.data.completedAt).toBeInstanceOf(Date);
    });

    it('should transition running -> failed', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1', status: 'running' });
      mockPrisma.syncRun.update.mockResolvedValue({ id: '1', status: 'failed' });
      const result = await service.updateStatus('1', { status: 'failed', errorLog: 'timeout' });
      expect(result.status).toBe('failed');
    });

    it('should set completedAt when transitioning to failed', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1', status: 'running' });
      mockPrisma.syncRun.update.mockResolvedValue({ id: '1', status: 'failed' });
      await service.updateStatus('1', { status: 'failed' });
      const updateCall = mockPrisma.syncRun.update.mock.calls[0][0];
      expect(updateCall.data.completedAt).toBeInstanceOf(Date);
    });

    it('should transition failed -> pending (retry)', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1', status: 'failed' });
      mockPrisma.syncRun.update.mockResolvedValue({ id: '1', status: 'pending' });
      const result = await service.updateStatus('1', { status: 'pending' });
      expect(result.status).toBe('pending');
    });

    it('should reject invalid transition pending -> completed', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1', status: 'pending' });
      await expect(service.updateStatus('1', { status: 'completed' })).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition pending -> failed', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1', status: 'pending' });
      await expect(service.updateStatus('1', { status: 'failed' })).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition completed -> running', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1', status: 'completed' });
      await expect(service.updateStatus('1', { status: 'running' })).rejects.toThrow(BadRequestException);
    });

    it('should include rowsIngested in update data', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1', status: 'running' });
      mockPrisma.syncRun.update.mockResolvedValue({ id: '1', status: 'completed' });
      await service.updateStatus('1', { status: 'completed', rowsIngested: 42 });
      const updateCall = mockPrisma.syncRun.update.mock.calls[0][0];
      expect(updateCall.data.rowsIngested).toBe(42);
    });

    it('should include errorLog in update data', async () => {
      mockPrisma.syncRun.findUniqueOrThrow.mockResolvedValue({ id: '1', status: 'running' });
      mockPrisma.syncRun.update.mockResolvedValue({ id: '1', status: 'failed' });
      await service.updateStatus('1', { status: 'failed', errorLog: 'Connection timeout' });
      const updateCall = mockPrisma.syncRun.update.mock.calls[0][0];
      expect(updateCall.data.errorLog).toBe('Connection timeout');
    });
  });

  describe('getHistory', () => {
    it('should return sync runs for a data source', async () => {
      mockPrisma.syncRun.findMany.mockResolvedValue([]);
      await service.getHistory('ds1');
      expect(mockPrisma.syncRun.findMany).toHaveBeenCalledWith({
        where: { dataSourceId: 'ds1' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    });

    it('should use custom limit', async () => {
      mockPrisma.syncRun.findMany.mockResolvedValue([]);
      await service.getHistory('ds1', 5);
      expect(mockPrisma.syncRun.findMany).toHaveBeenCalledWith({
        where: { dataSourceId: 'ds1' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    });
  });

  describe('remove', () => {
    it('should delete a sync run', async () => {
      mockPrisma.syncRun.delete.mockResolvedValue({ id: '1' });
      await service.remove('1');
      expect(mockPrisma.syncRun.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
