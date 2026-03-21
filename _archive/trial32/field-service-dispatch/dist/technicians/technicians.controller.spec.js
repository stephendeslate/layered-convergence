"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _technicianscontroller = require("./technicians.controller");
const _techniciansservice = require("./technicians.service");
const mockService = {
    create: _vitest.vi.fn(),
    findAll: _vitest.vi.fn(),
    findOne: _vitest.vi.fn(),
    update: _vitest.vi.fn(),
    delete: _vitest.vi.fn(),
    findAvailable: _vitest.vi.fn()
};
(0, _vitest.describe)('TechniciansController', ()=>{
    let controller;
    (0, _vitest.beforeEach)(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _technicianscontroller.TechniciansController
            ],
            providers: [
                {
                    provide: _techniciansservice.TechniciansService,
                    useValue: mockService
                }
            ]
        }).compile();
        controller = module.get(_technicianscontroller.TechniciansController);
        _vitest.vi.clearAllMocks();
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(controller).toBeDefined();
    });
    (0, _vitest.it)('should call create with companyId', async ()=>{
        const dto = {
            name: 'John',
            email: 'john@test.com'
        };
        mockService.create.mockResolvedValue({
            id: '1',
            ...dto
        });
        const result = await controller.create('comp-1', dto);
        (0, _vitest.expect)(mockService.create).toHaveBeenCalledWith('comp-1', dto);
        (0, _vitest.expect)(result.name).toBe('John');
    });
    (0, _vitest.it)('should call findAll', async ()=>{
        mockService.findAll.mockResolvedValue([]);
        await controller.findAll('comp-1');
        (0, _vitest.expect)(mockService.findAll).toHaveBeenCalledWith('comp-1');
    });
    (0, _vitest.it)('should call findAvailable', async ()=>{
        mockService.findAvailable.mockResolvedValue([]);
        await controller.findAvailable('comp-1');
        (0, _vitest.expect)(mockService.findAvailable).toHaveBeenCalledWith('comp-1');
    });
    (0, _vitest.it)('should call findOne', async ()=>{
        mockService.findOne.mockResolvedValue({
            id: '1'
        });
        await controller.findOne('comp-1', '1');
        (0, _vitest.expect)(mockService.findOne).toHaveBeenCalledWith('comp-1', '1');
    });
    (0, _vitest.it)('should call update', async ()=>{
        mockService.update.mockResolvedValue({
            id: '1'
        });
        await controller.update('comp-1', '1', {
            name: 'Updated'
        });
        (0, _vitest.expect)(mockService.update).toHaveBeenCalledWith('comp-1', '1', {
            name: 'Updated'
        });
    });
    (0, _vitest.it)('should call delete', async ()=>{
        mockService.delete.mockResolvedValue({
            id: '1'
        });
        await controller.delete('comp-1', '1');
        (0, _vitest.expect)(mockService.delete).toHaveBeenCalledWith('comp-1', '1');
    });
});

//# sourceMappingURL=technicians.controller.spec.js.map