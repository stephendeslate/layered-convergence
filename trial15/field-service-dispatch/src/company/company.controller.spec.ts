import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('CompanyController', () => {
  let controller: CompanyController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [{ provide: CompanyService, useValue: mockService }],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with dto', async () => {
      const dto = { name: 'Test Corp' };
      const expected = { id: '1', ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);
      expect(result).toEqual(expected);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const companies = [{ id: '1', name: 'A' }];
      mockService.findAll.mockResolvedValue(companies);

      const result = await controller.findAll();
      expect(result).toEqual(companies);
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      const company = { id: '1', name: 'A' };
      mockService.findOne.mockResolvedValue(company);

      const result = await controller.findOne('1');
      expect(result).toEqual(company);
      expect(mockService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const dto = { name: 'Updated' };
      mockService.update.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.update('1', dto);
      expect(result.name).toBe('Updated');
      expect(mockService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should remove a company', async () => {
      mockService.remove.mockResolvedValue({ id: '1', name: 'Gone' });

      const result = await controller.remove('1');
      expect(result.id).toBe('1');
      expect(mockService.remove).toHaveBeenCalledWith('1');
    });
  });
});
