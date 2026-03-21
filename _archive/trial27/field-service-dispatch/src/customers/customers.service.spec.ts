import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  customer: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      mockPrisma.customer.create.mockResolvedValue({
        id: '1',
        name: 'John',
        address: '123 Main',
      });
      const result = await service.create('comp-1', {
        name: 'John',
        address: '123 Main',
      });
      expect(result.name).toBe('John');
    });

    it('should include lat/lng when provided', async () => {
      mockPrisma.customer.create.mockResolvedValue({ id: '1' });
      await service.create('comp-1', {
        name: 'Jane',
        address: '456 Oak',
        lat: 40.0,
        lng: -74.0,
      });
      expect(mockPrisma.customer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ lat: 40.0, lng: -74.0 }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return customers for company', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1', name: 'John' });
      const result = await service.findOne('comp-1', '1');
      expect(result.name).toBe('John');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      await expect(service.findOne('comp-1', 'bad')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.customer.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await service.update('comp-1', '1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete a customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.customer.delete.mockResolvedValue({ id: '1' });
      const result = await service.delete('comp-1', '1');
      expect(result.id).toBe('1');
    });
  });
});
