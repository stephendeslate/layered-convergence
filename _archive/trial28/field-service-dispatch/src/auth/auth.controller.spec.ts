import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
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
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register', async () => {
    const dto = { email: 'test@test.com', name: 'Test', password: 'pass', companyId: 'c1' };
    mockService.register.mockResolvedValue({ user: { id: 'u1' }, token: 'tok' });
    const result = await controller.register(dto as any);
    expect(mockService.register).toHaveBeenCalledWith(dto);
    expect(result.token).toBe('tok');
  });

  it('should call login', async () => {
    const dto = { email: 'test@test.com', password: 'pass' };
    mockService.login.mockResolvedValue({ user: { id: 'u1' }, token: 'tok' });
    const result = await controller.login(dto as any);
    expect(mockService.login).toHaveBeenCalledWith(dto);
    expect(result.token).toBe('tok');
  });

  it('should call validateUser for me endpoint', async () => {
    mockService.validateUser.mockResolvedValue({ id: 'u1' });
    const req = { user: { userId: 'u1' } };
    const result = await controller.me(req);
    expect(mockService.validateUser).toHaveBeenCalledWith('u1');
    expect(result.id).toBe('u1');
  });
});
