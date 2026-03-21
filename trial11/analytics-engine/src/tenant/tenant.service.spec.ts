import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  tenant: {
    create: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tenant with generated apiKey', async () => {
      const dto = { name: 'Acme Corp' };
      const expected = { id: '1', name: 'Acme Corp', apiKey: 'some-uuid' };
      mockPrisma.tenant.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.tenant.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'Acme Corp', apiKey: expect.any(String) }),
      });
    });
  });

  describe('findById', () => {
    it('should return a tenant by id', async () => {
      const tenant = { id: '1', name: 'Acme Corp' };
      mockPrisma.tenant.findUniqueOrThrow.mockResolvedValue(tenant);

      const result = await service.findById('1');

      expect(result).toEqual(tenant);
      expect(mockPrisma.tenant.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      const tenant = { id: '1', name: 'Updated Corp' };
      mockPrisma.tenant.update.mockResolvedValue(tenant);

      const result = await service.update('1', { name: 'Updated Corp' });

      expect(result).toEqual(tenant);
      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated Corp' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a tenant', async () => {
      mockPrisma.tenant.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');

      expect(result).toEqual({ id: '1' });
      expect(mockPrisma.tenant.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('findByApiKey', () => {
    it('should find a tenant by API key', async () => {
      const tenant = { id: '1', apiKey: 'key-123' };
      mockPrisma.tenant.findFirst.mockResolvedValue(tenant);

      const result = await service.findByApiKey('key-123');

      expect(result).toEqual(tenant);
      expect(mockPrisma.tenant.findFirst).toHaveBeenCalledWith({
        where: { apiKey: 'key-123' },
      });
    });
  });
});
