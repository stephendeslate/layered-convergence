import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeService } from './theme.service';

const mockPrisma = {
  tenant: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  embedConfig: {
    findUnique: vi.fn(),
  },
};

const mockAuditService = {
  log: vi.fn().mockResolvedValue(undefined),
};

const defaultTheme = {
  primaryColor: '#3B82F6',
  secondaryColor: '#6366F1',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  fontFamily: 'Inter',
  cornerRadius: 8,
  logoUrl: null,
};

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ThemeService(mockPrisma as any, mockAuditService as any);
  });

  describe('getTenantTheme', () => {
    it('should return theme config for a valid tenant', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(defaultTheme);

      const result = await service.getTenantTheme('tenant-1');

      expect(result).toEqual(defaultTheme);
      expect(mockPrisma.tenant.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'tenant-1' } }),
      );
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      await expect(service.getTenantTheme('nonexistent')).rejects.toThrow(
        'Tenant not found',
      );
    });
  });

  describe('updateTenantTheme', () => {
    it('should update specified theme fields', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1' });
      mockPrisma.tenant.update.mockResolvedValue({
        ...defaultTheme,
        primaryColor: '#FF0000',
      });

      const result = await service.updateTenantTheme('tenant-1', {
        primaryColor: '#FF0000',
      });

      expect(result.primaryColor).toBe('#FF0000');
      expect(mockPrisma.tenant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { primaryColor: '#FF0000' },
        }),
      );
    });

    it('should log an audit event with changed fields', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1' });
      mockPrisma.tenant.update.mockResolvedValue({
        ...defaultTheme,
        fontFamily: 'Roboto',
        cornerRadius: 12,
      });

      await service.updateTenantTheme('tenant-1', {
        fontFamily: 'Roboto',
        cornerRadius: 12,
      });

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-1',
          metadata: { changedFields: ['fontFamily', 'cornerRadius'] },
        }),
      );
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTenantTheme('nonexistent', { primaryColor: '#FF0000' }),
      ).rejects.toThrow('Tenant not found');
    });
  });

  describe('getEmbedTheme', () => {
    it('should return tenant theme for a valid embed config', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue({
        tenantId: 'tenant-1',
      });
      mockPrisma.tenant.findUnique.mockResolvedValue(defaultTheme);

      const result = await service.getEmbedTheme('embed-1');

      expect(result).toEqual(defaultTheme);
    });

    it('should throw NotFoundException if embed config not found', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue(null);

      await expect(service.getEmbedTheme('nonexistent')).rejects.toThrow(
        'Embed config not found',
      );
    });
  });

  describe('generateCssVariables', () => {
    it('should generate CSS custom properties with --ae- prefix', () => {
      const css = service.generateCssVariables(defaultTheme);

      expect(css).toContain(':root {');
      expect(css).toContain('--ae-primary-color: #3B82F6;');
      expect(css).toContain('--ae-secondary-color: #6366F1;');
      expect(css).toContain('--ae-background-color: #FFFFFF;');
      expect(css).toContain('--ae-text-color: #1F2937;');
      expect(css).toContain('--ae-font-family: Inter, sans-serif;');
      expect(css).toContain('--ae-corner-radius: 8px;');
    });

    it('should not include logo-url when logoUrl is null', () => {
      const css = service.generateCssVariables(defaultTheme);

      expect(css).not.toContain('--ae-logo-url');
    });

    it('should include logo-url when logoUrl is set', () => {
      const css = service.generateCssVariables({
        ...defaultTheme,
        logoUrl: 'https://example.com/logo.png',
      });

      expect(css).toContain(
        "--ae-logo-url: url('https://example.com/logo.png');",
      );
    });
  });
});
