import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Reflector } from '@nestjs/core';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;

  beforeEach(async () => {
    usersService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: Reflector, useValue: { getAllAndOverride: vi.fn() } },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should call create', async () => {
    const dto = { email: 'a@b.com', password: '12345678', name: 'A', role: 'BUYER' as const, tenantId: 't1' };
    usersService.create.mockResolvedValue({ id: '1' });

    const result = await controller.create(dto);

    expect(usersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: '1' });
  });

  it('should call findAll', async () => {
    usersService.findAll.mockResolvedValue([]);

    const result = await controller.findAll('t1');

    expect(usersService.findAll).toHaveBeenCalledWith('t1');
    expect(result).toEqual([]);
  });

  it('should call findOne', async () => {
    usersService.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1', 't1');

    expect(usersService.findOne).toHaveBeenCalledWith('1', 't1');
    expect(result).toEqual({ id: '1' });
  });

  it('should call update', async () => {
    usersService.update.mockResolvedValue({ id: '1', name: 'Updated' });

    const result = await controller.update('1', 't1', { name: 'Updated' });

    expect(usersService.update).toHaveBeenCalledWith('1', 't1', { name: 'Updated' });
    expect(result).toEqual({ id: '1', name: 'Updated' });
  });

  it('should call remove', async () => {
    usersService.remove.mockResolvedValue({ id: '1' });

    const result = await controller.remove('1', 't1');

    expect(usersService.remove).toHaveBeenCalledWith('1', 't1');
    expect(result).toEqual({ id: '1' });
  });
});
