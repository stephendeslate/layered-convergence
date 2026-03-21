import { NotFoundException } from '@nestjs/common';
import { TechnicianService } from './technician.service.js';

const mockPrisma = {
  technician: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('TechnicianService', () => {
  let service: TechnicianService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TechnicianService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a technician', async () => {
      const dto = { companyId: 'c1', name: 'John', email: 'j@e.com', skills: ['plumbing'] };
      const result = { id: 't1', ...dto };
      mockPrisma.technician.create.mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
      expect(mockPrisma.technician.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAllByCompany', () => {
    it('should return technicians for a company', async () => {
      const techs = [{ id: 't1', companyId: 'c1' }];
      mockPrisma.technician.findMany.mockResolvedValue(techs);

      expect(await service.findAllByCompany('c1')).toEqual(techs);
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a technician scoped by company', async () => {
      const tech = { id: 't1', companyId: 'c1' };
      mockPrisma.technician.findFirst.mockResolvedValue(tech);

      expect(await service.findOne('t1', 'c1')).toEqual(tech);
      expect(mockPrisma.technician.findFirst).toHaveBeenCalledWith({
        where: { id: 't1', companyId: 'c1' },
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 't1' });
      const updated = { id: 't1', name: 'Jane' };
      mockPrisma.technician.update.mockResolvedValue(updated);

      expect(await service.update('t1', 'c1', { name: 'Jane' })).toEqual(updated);
    });

    it('should throw NotFoundException on update if not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.update('t1', 'c1', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePosition', () => {
    it('should update technician position', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 't1' });
      const updated = { id: 't1', currentLat: 40.7, currentLng: -74.0 };
      mockPrisma.technician.update.mockResolvedValue(updated);

      expect(await service.updatePosition('t1', 'c1', 40.7, -74.0)).toEqual(updated);
      expect(mockPrisma.technician.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { currentLat: 40.7, currentLng: -74.0 },
      });
    });
  });

  describe('remove', () => {
    it('should delete a technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 't1' });
      mockPrisma.technician.delete.mockResolvedValue({ id: 't1' });

      expect(await service.remove('t1', 'c1')).toEqual({ id: 't1' });
    });

    it('should throw NotFoundException on remove if not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.remove('t1', 'c1')).rejects.toThrow(NotFoundException);
    });
  });
});
