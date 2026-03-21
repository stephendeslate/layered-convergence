import { EmbedService } from './embed.service';

const mockPrisma = {
  embedConfig: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('EmbedService', () => {
  let service: EmbedService;

  beforeEach(() => {
    service = new EmbedService(mockPrisma as any);
    vi.clearAllMocks();
  });

  it('should create an embed config', async () => {
    const dto = { dashboardId: 'd1', allowedOrigins: ['https://example.com'] };
    mockPrisma.embedConfig.create.mockResolvedValue({ id: '1', ...dto });
    const result = await service.create(dto);
    expect(result.dashboardId).toBe('d1');
  });

  it('should create with defaults for missing optional fields', async () => {
    const dto = { dashboardId: 'd1' };
    mockPrisma.embedConfig.create.mockResolvedValue({ id: '1', dashboardId: 'd1' });
    await service.create(dto as any);
    expect(mockPrisma.embedConfig.create).toHaveBeenCalledWith({
      data: {
        dashboardId: 'd1',
        allowedOrigins: [],
        themeOverrides: {},
      },
    });
  });

  it('should find by dashboard', async () => {
    mockPrisma.embedConfig.findUnique.mockResolvedValue({ id: '1', dashboardId: 'd1' });
    const result = await service.findByDashboard('d1');
    expect(result?.dashboardId).toBe('d1');
  });

  it('should find one embed config', async () => {
    mockPrisma.embedConfig.findUniqueOrThrow.mockResolvedValue({ id: '1' });
    const result = await service.findOne('1');
    expect(result.id).toBe('1');
  });

  it('should update an embed config', async () => {
    mockPrisma.embedConfig.update.mockResolvedValue({ id: '1', allowedOrigins: ['https://new.com'] });
    const result = await service.update('1', { allowedOrigins: ['https://new.com'] });
    expect(result.allowedOrigins).toContain('https://new.com');
  });

  it('should remove an embed config', async () => {
    mockPrisma.embedConfig.delete.mockResolvedValue({ id: '1' });
    await service.remove('1');
    expect(mockPrisma.embedConfig.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  describe('isOriginAllowed', () => {
    it('should return true for empty allowed origins', () => {
      expect(service.isOriginAllowed([], 'https://any.com')).toBe(true);
    });

    it('should return true if origin is in allowed list', () => {
      expect(service.isOriginAllowed(['https://a.com', 'https://b.com'], 'https://a.com')).toBe(true);
    });

    it('should return false if origin is not in allowed list', () => {
      expect(service.isOriginAllowed(['https://a.com'], 'https://b.com')).toBe(false);
    });
  });
});
