import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHash } from 'crypto';
import { ApiKeyService } from './api-key.service';

const mockPrisma = {
  apiKey: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

const mockAuditService = {
  log: vi.fn().mockResolvedValue(undefined),
};

describe('ApiKeyService', () => {
  let service: ApiKeyService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ApiKeyService(mockPrisma as any, mockAuditService as any);
  });

  describe('create', () => {
    it('should generate an API key and return the plain key once', async () => {
      mockPrisma.apiKey.create.mockImplementation(({ data }) => {
        return Promise.resolve({
          id: 'key-1',
          tenantId: 'tenant-1',
          type: data.type,
          keyHash: data.keyHash,
          keyPrefix: data.keyPrefix,
          name: data.name,
        });
      });

      const result = await service.create('tenant-1', {
        name: 'My Embed Key',
      });

      expect(result.key).toBeDefined();
      expect(result.key.length).toBeGreaterThan(20);
      expect(result.id).toBe('key-1');
      expect(result.name).toBe('My Embed Key');
      expect(result.keyPrefix).toBe(result.key.slice(-4));
    });

    it('should store SHA-256 hash of the key, not the plain key', async () => {
      let storedHash = '';
      mockPrisma.apiKey.create.mockImplementation(({ data }) => {
        storedHash = data.keyHash;
        return Promise.resolve({
          id: 'key-1',
          type: data.type,
          keyHash: data.keyHash,
          keyPrefix: data.keyPrefix,
          name: data.name,
        });
      });

      const result = await service.create('tenant-1', {
        name: 'Test Key',
      });

      // Verify the stored hash matches SHA-256 of the returned key
      const expectedHash = createHash('sha256')
        .update(result.key)
        .digest('hex');
      expect(storedHash).toBe(expectedHash);
    });

    it('should default to EMBED type when not specified', async () => {
      mockPrisma.apiKey.create.mockImplementation(({ data }) => {
        return Promise.resolve({
          id: 'key-1',
          type: data.type,
          keyHash: data.keyHash,
          keyPrefix: data.keyPrefix,
          name: data.name,
        });
      });

      const result = await service.create('tenant-1', {
        name: 'Default Type',
      });

      expect(result.type).toBe('EMBED');
    });

    it('should log an audit event on creation', async () => {
      mockPrisma.apiKey.create.mockResolvedValue({
        id: 'key-1',
        type: 'EMBED',
        keyHash: 'hash',
        keyPrefix: 'xxxx',
        name: 'Test Key',
      });

      await service.create('tenant-1', { name: 'Test Key' });

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-1',
          resourceType: 'ApiKey',
          resourceId: 'key-1',
        }),
      );
    });
  });

  describe('revoke', () => {
    it('should set isActive to false and revokedAt', async () => {
      mockPrisma.apiKey.findFirst.mockResolvedValue({
        id: 'key-1',
        tenantId: 'tenant-1',
        keyPrefix: 'xxxx',
      });
      mockPrisma.apiKey.update.mockResolvedValue({});

      await service.revoke('key-1', 'tenant-1');

      expect(mockPrisma.apiKey.update).toHaveBeenCalledWith({
        where: { id: 'key-1' },
        data: {
          isActive: false,
          revokedAt: expect.any(Date),
        },
      });
    });

    it('should log an audit event on revocation', async () => {
      mockPrisma.apiKey.findFirst.mockResolvedValue({
        id: 'key-1',
        tenantId: 'tenant-1',
        keyPrefix: 'abcd',
      });
      mockPrisma.apiKey.update.mockResolvedValue({});

      await service.revoke('key-1', 'tenant-1');

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-1',
          resourceType: 'ApiKey',
          metadata: { keyPrefix: 'abcd' },
        }),
      );
    });

    it('should throw NotFoundException if API key not found', async () => {
      mockPrisma.apiKey.findFirst.mockResolvedValue(null);

      await expect(
        service.revoke('nonexistent', 'tenant-1'),
      ).rejects.toThrow('API key not found');
    });
  });

  describe('list', () => {
    it('should return keys ordered by creation date', async () => {
      const keys = [
        { id: 'key-2', name: 'Newer', keyPrefix: 'yyyy', createdAt: new Date('2024-02-01') },
        { id: 'key-1', name: 'Older', keyPrefix: 'xxxx', createdAt: new Date('2024-01-01') },
      ];
      mockPrisma.apiKey.findMany.mockResolvedValue(keys);

      const result = await service.list('tenant-1');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Newer');
    });
  });

  describe('validate', () => {
    it('should validate an active key and update lastUsedAt', async () => {
      const plainKey = 'test-key-value';
      const hash = createHash('sha256').update(plainKey).digest('hex');

      mockPrisma.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        type: 'EMBED',
        tenantId: 'tenant-1',
        keyHash: hash,
        isActive: true,
        revokedAt: null,
        expiresAt: null,
        tenant: { id: 'tenant-1', tier: 'PRO' },
      });
      mockPrisma.apiKey.update.mockResolvedValue({});

      const result = await service.validate(plainKey);

      expect(result.id).toBe('key-1');
      expect(result.tenantId).toBe('tenant-1');
      expect(mockPrisma.apiKey.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { lastUsedAt: expect.any(Date) },
        }),
      );
    });

    it('should throw UnauthorizedException for invalid key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(null);

      await expect(service.validate('bad-key')).rejects.toThrow(
        'Invalid API key',
      );
    });

    it('should throw UnauthorizedException for inactive key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        isActive: false,
        revokedAt: null,
        expiresAt: null,
      });

      await expect(service.validate('some-key')).rejects.toThrow(
        'API key is inactive',
      );
    });

    it('should throw UnauthorizedException for revoked key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        isActive: true,
        revokedAt: new Date(),
        expiresAt: null,
      });

      await expect(service.validate('some-key')).rejects.toThrow(
        'API key has been revoked',
      );
    });

    it('should throw UnauthorizedException for expired key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue({
        id: 'key-1',
        isActive: true,
        revokedAt: null,
        expiresAt: new Date('2020-01-01'), // In the past
      });

      await expect(service.validate('some-key')).rejects.toThrow(
        'API key has expired',
      );
    });
  });
});
