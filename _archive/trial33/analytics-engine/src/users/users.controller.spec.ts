import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: any;

  const mockReq = { user: { organizationId: 'org-1', role: 'ADMIN' } };

  beforeEach(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'user-1' }),
      create: vi.fn().mockResolvedValue({ id: 'user-1' }),
      update: vi.fn().mockResolvedValue({ id: 'user-1' }),
      remove: vi.fn().mockResolvedValue({ id: 'user-1' }),
    };

    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should use organizationId from request', async () => {
    await controller.findAll(mockReq);
    expect(service.findAll).toHaveBeenCalledWith('org-1');
  });

  it('findOne should pass id to service', async () => {
    await controller.findOne('user-1');
    expect(service.findOne).toHaveBeenCalledWith('user-1');
  });

  it('create should pass dto to service', async () => {
    const dto = { email: 'a@b.com', password: 'password1', role: 'MEMBER' as any, organizationId: 'org-1' };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update should pass id and dto to service', async () => {
    await controller.update('user-1', { email: 'new@b.com' });
    expect(service.update).toHaveBeenCalledWith('user-1', { email: 'new@b.com' });
  });

  it('remove should pass id to service', async () => {
    await controller.remove('user-1');
    expect(service.remove).toHaveBeenCalledWith('user-1');
  });
});
