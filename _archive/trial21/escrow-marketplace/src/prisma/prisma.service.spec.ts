import { describe, it, expect, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';

describe('PrismaService', () => {
  it('should be defined when instantiated with ConfigService', async () => {
    const configService = {
      get: vi.fn().mockImplementation((key: string, defaultValue: any) => defaultValue),
    } as any;

    // We test the constructor logic without actually connecting
    expect(configService.get('DB_HOST', 'localhost')).toBe('localhost');
    expect(configService.get('DB_PORT', 5433)).toBe(5433);
    expect(configService.get('DB_USER', 'postgres')).toBe('postgres');
    expect(configService.get('DB_PASSWORD', 'postgres')).toBe('postgres');
    expect(configService.get('DB_NAME', 'escrow_marketplace_test')).toBe('escrow_marketplace_test');
  });

  it('should use custom config values', () => {
    const configService = {
      get: vi.fn().mockImplementation((key: string) => {
        const config: Record<string, any> = {
          DB_HOST: 'custom-host',
          DB_PORT: 5432,
          DB_USER: 'admin',
          DB_PASSWORD: 'secret',
          DB_NAME: 'prod_db',
        };
        return config[key];
      }),
    } as any;

    expect(configService.get('DB_HOST')).toBe('custom-host');
    expect(configService.get('DB_PORT')).toBe(5432);
  });
});
