import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockService = {
  register: vi.fn(),
  login: vi.fn(),
  validateUser: vi.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get(AuthController);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register', async () => {
    const dto = { email: 'test@test.com', password: 'pass', name: 'Test', companyId: 'c1' };
    mockService.register.mockResolvedValue({ user: { id: '1' }, token: 'tok' });
    const result = await controller.register(dto);
    expect(result.token).toBe('tok');
  });

  it('should call login', async () => {
    const dto = { email: 'test@test.com', password: 'pass' };
    mockService.login.mockResolvedValue({ user: { id: '1' }, token: 'tok' });
    const result = await controller.login(dto);
    expect(result.token).toBe('tok');
  });

  it('should call me', async () => {
    mockService.validateUser.mockResolvedValue({ id: '1' });
    const result = await controller.me({ user: { userId: '1' } });
    expect(result.id).toBe('1');
  });
});
