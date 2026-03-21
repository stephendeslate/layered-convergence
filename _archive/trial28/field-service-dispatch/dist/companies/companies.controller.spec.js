"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _companiescontroller = require("./companies.controller");
const _companiesservice = require("./companies.service");
const mockService = {
    create: _vitest.vi.fn(),
    findAll: _vitest.vi.fn(),
    findOne: _vitest.vi.fn(),
    update: _vitest.vi.fn(),
    delete: _vitest.vi.fn()
};
(0, _vitest.describe)('CompaniesController', ()=>{
    let controller;
    (0, _vitest.beforeEach)(async ()=>{
        _vitest.vi.clearAllMocks();
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _companiescontroller.CompaniesController
            ],
            providers: [
                {
                    provide: _companiesservice.CompaniesService,
                    useValue: mockService
                }
            ]
        }).compile();
        controller = module.get(_companiescontroller.CompaniesController);
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(controller).toBeDefined();
    });
    (0, _vitest.it)('should call create', async ()=>{
        const dto = {
            name: 'ACME',
            slug: 'acme'
        };
        mockService.create.mockResolvedValue({
            id: 'c1'
        });
        await controller.create(dto);
        (0, _vitest.expect)(mockService.create).toHaveBeenCalledWith(dto);
    });
    (0, _vitest.it)('should call findAll', async ()=>{
        mockService.findAll.mockResolvedValue([]);
        const result = await controller.findAll();
        (0, _vitest.expect)(result).toEqual([]);
    });
    (0, _vitest.it)('should call findOne', async ()=>{
        mockService.findOne.mockResolvedValue({
            id: 'c1'
        });
        const result = await controller.findOne('c1');
        (0, _vitest.expect)(result.id).toBe('c1');
    });
    (0, _vitest.it)('should call update', async ()=>{
        mockService.update.mockResolvedValue({
            id: 'c1'
        });
        await controller.update('c1', {
            name: 'Updated'
        });
        (0, _vitest.expect)(mockService.update).toHaveBeenCalledWith('c1', {
            name: 'Updated'
        });
    });
    (0, _vitest.it)('should call delete', async ()=>{
        mockService.delete.mockResolvedValue({
            id: 'c1'
        });
        await controller.delete('c1');
        (0, _vitest.expect)(mockService.delete).toHaveBeenCalledWith('c1');
    });
});

//# sourceMappingURL=companies.controller.spec.js.map