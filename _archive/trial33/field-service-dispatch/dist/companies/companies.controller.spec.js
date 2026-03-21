"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _companiescontroller = require("./companies.controller");
(0, _vitest.describe)('CompaniesController', ()=>{
    let controller;
    let service;
    (0, _vitest.beforeEach)(()=>{
        service = {
            create: _vitest.vi.fn(),
            findAll: _vitest.vi.fn(),
            findOne: _vitest.vi.fn(),
            update: _vitest.vi.fn(),
            delete: _vitest.vi.fn()
        };
        controller = new _companiescontroller.CompaniesController(service);
    });
    (0, _vitest.it)('should call service.create', async ()=>{
        const dto = {
            name: 'Test',
            slug: 'test'
        };
        service.create.mockResolvedValue({
            id: 'c-1',
            ...dto
        });
        const result = await controller.create(dto);
        (0, _vitest.expect)(result.id).toBe('c-1');
        (0, _vitest.expect)(service.create).toHaveBeenCalledWith(dto);
    });
    (0, _vitest.it)('should call service.findAll', async ()=>{
        service.findAll.mockResolvedValue([
            {
                id: 'c-1'
            }
        ]);
        const result = await controller.findAll();
        (0, _vitest.expect)(result).toHaveLength(1);
    });
    (0, _vitest.it)('should call service.findOne', async ()=>{
        service.findOne.mockResolvedValue({
            id: 'c-1'
        });
        const result = await controller.findOne('c-1');
        (0, _vitest.expect)(result.id).toBe('c-1');
    });
    (0, _vitest.it)('should call service.update', async ()=>{
        service.update.mockResolvedValue({
            id: 'c-1',
            name: 'Updated'
        });
        const result = await controller.update('c-1', {
            name: 'Updated'
        });
        (0, _vitest.expect)(result.name).toBe('Updated');
    });
    (0, _vitest.it)('should call service.delete', async ()=>{
        service.delete.mockResolvedValue({
            id: 'c-1'
        });
        const result = await controller.delete('c-1');
        (0, _vitest.expect)(result.id).toBe('c-1');
    });
});

//# sourceMappingURL=companies.controller.spec.js.map