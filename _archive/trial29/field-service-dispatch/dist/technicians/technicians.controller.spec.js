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
                }
            ]
        }).compile();
        controller = module.get(_technicianscontroller.TechniciansController);
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
            id: 't1'
        });
        await controller.create('comp1', dto);
        (0, _vitest.expect)(mockService.create).toHaveBeenCalledWith('comp1', dto);
    });
    (0, _vitest.it)('should call findAll with status filter', async ()=>{
        mockService.findAll.mockResolvedValue([]);
        await controller.findAll('comp1', 'AVAILABLE');
        (0, _vitest.expect)(mockService.findAll).toHaveBeenCalledWith('comp1', 'AVAILABLE');
    });
    (0, _vitest.it)('should call findOne', async ()=>{
        mockService.findOne.mockResolvedValue({
            id: 't1'
        });
        await controller.findOne('comp1', 't1');
        (0, _vitest.expect)(mockService.findOne).toHaveBeenCalledWith('comp1', 't1');
    });
    (0, _vitest.it)('should call update', async ()=>{
        mockService.update.mockResolvedValue({
            id: 't1'
        });
        await controller.update('comp1', 't1', {
            name: 'Jane'
        });
        (0, _vitest.expect)(mockService.update).toHaveBeenCalledWith('comp1', 't1', {
            name: 'Jane'
        });
    });
    (0, _vitest.it)('should call delete', async ()=>{
        mockService.delete.mockResolvedValue({
            id: 't1'
        });
        await controller.delete('comp1', 't1');
        (0, _vitest.expect)(mockService.delete).toHaveBeenCalledWith('comp1', 't1');
    });
});

//# sourceMappingURL=technicians.controller.spec.js.map