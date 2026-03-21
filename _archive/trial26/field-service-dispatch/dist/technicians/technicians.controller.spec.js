"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _technicianscontroller = require("./technicians.controller");
const _techniciansservice = require("./technicians.service");
const _core = require("@nestjs/core");
const mockService = {
    create: _vitest.vi.fn(),
    findAll: _vitest.vi.fn(),
    findOne: _vitest.vi.fn(),
    update: _vitest.vi.fn(),
    delete: _vitest.vi.fn()
};
(0, _vitest.describe)('TechniciansController', ()=>{
    let controller;
    (0, _vitest.beforeEach)(async ()=>{
        _vitest.vi.clearAllMocks();
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _technicianscontroller.TechniciansController
            ],
            providers: [
                {
                    provide: _techniciansservice.TechniciansService,
                    useValue: mockService
                },
                _core.Reflector
            ]
        }).compile();
        controller = module.get(_technicianscontroller.TechniciansController);
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(controller).toBeDefined();
    });
    (0, _vitest.it)('should call create', async ()=>{
        mockService.create.mockResolvedValue({
            id: '1'
        });
        const result = await controller.create('comp-1', {
            name: 'Tech',
            email: 'tech@test.com'
        });
        (0, _vitest.expect)(mockService.create).toHaveBeenCalledWith('comp-1', _vitest.expect.any(Object));
    });
    (0, _vitest.it)('should call findAll', async ()=>{
        mockService.findAll.mockResolvedValue([]);
        const result = await controller.findAll('comp-1');
        (0, _vitest.expect)(result).toEqual([]);
    });
    (0, _vitest.it)('should call findOne', async ()=>{
        mockService.findOne.mockResolvedValue({
            id: '1'
        });
        const result = await controller.findOne('comp-1', '1');
        (0, _vitest.expect)(result.id).toBe('1');
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