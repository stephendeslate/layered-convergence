import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let prisma: any;

  const mockOrg = {
    id: 'org-1',
    name: 'Test Org',
    slug: 'test-org',
    apiKey: 'key-123',
    branding: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      organization: {
        findMany: vi.fn().mockResolvedValue([mockOrg]),
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue(mockOrg),
        update: vi.fn().mockResolvedValue(mockOrg),
        delete: vi.fn().mockResolvedValue(mockOrg),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  describe('findAll', () => {
    it('should return all organizations', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockOrg]);
    });
  });

  describe('findOne', () => {
    it('should return org by id', async () => {
      prisma.organization.findUnique.mockResolvedValue(mockOrg);
      const result = await service.findOne('org-1');
      expect(result).toEqual(mockOrg);
    });

    it('should throw NotFoundException when org not found', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an organization with generated apiKey', async () => {
      await service.create({ name: 'New Org', slug: 'new-org' });
      expect(prisma.organization.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Org',
          slug: 'new-org',
          apiKey: expect.any(String),
        }),
      });
    });

    it('should pass branding when provided', async () => {
      await service.create({ name: 'Org', slug: 'org', branding: { color: 'blue' } });
      expect(prisma.organization.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          branding: { color: 'blue' },
        }),
      });
    });
  });

  describe('update', () => {
    it('should update an organization', async () => {
      await service.update('org-1', { name: 'Updated' });
      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        data: { name: 'Updated' },
      });
    });
  });

  describe('remove', () => {
    it('should delete an organization', async () => {
      await service.remove('org-1');
      expect(prisma.organization.delete).toHaveBeenCalledWith({ where: { id: 'org-1' } });
    });
  });
});
