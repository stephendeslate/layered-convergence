"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _technicianscontroller = require("./technicians.controller");
(0, _vitest.describe)('TechniciansController', ()=>{
    let controller;
    let service;
    (0, _vitest.beforeEach)(()=>{
        service = {
            create: _vitest.vi.fn(),
            findAll: _vitest.vi.fn(),
            findOne: _vitest.vi.fn(),
            update: _vitest.vi.fn(),
            delete: _vitest.vi.fn(),
            findAvailable: _vitest.vi.fn()
        };
        controller = new _technicianscontroller.TechniciansController(service);
    });
    (0, _vitest.it)('should call service.create with companyId and dto', async ()=>{
        const dto = {
            name: 'Tech',
            email: 'tech@test.com'
        };
        service.create.mockResolvedValue({
            id: 't-1'
        });
        await controller.create('company-1', dto);
        (0, _vitest.expect)(service.create).toHaveBeenCalledWith('company-1', dto);
    });
    (0, _vitest.it)('should call service.findAll with companyId', async ()=>{
        service.findAll.mockResolvedValue([]);
        await controller.findAll('company-1');
        (0, _vitest.expect)(service.findAll).toHaveBeenCalledWith('company-1');
    });
    (0, _vitest.it)('should call service.findAvailable with companyId', async ()=>{
        service.findAvailable.mockResolvedValue([]);
        await controller.findAvailable('company-1');
        (0, _vitest.expect)(service.findAvailable).toHaveBeenCalledWith('company-1');
    });
    (0, _vitest.it)('should call service.findOne with companyId and id', async ()=>{
        service.findOne.mockResolvedValue({
            id: 't-1'
        });
        await controller.findOne('company-1', 't-1');
        (0, _vitest.expect)(service.findOne).toHaveBeenCalledWith('company-1', 't-1');
    });
    (0, _vitest.it)('should call service.update with companyId, id, and dto', async ()=>{
        service.update.mockResolvedValue({
            id: 't-1'
        });
        await controller.update('company-1', 't-1', {
            name: 'Updated'
        });
        (0, _vitest.expect)(service.update).toHaveBeenCalledWith('company-1', 't-1', {
            name: 'Updated'
        });
    });
    (0, _vitest.it)('should call service.delete with companyId and id', async ()=>{
        service.delete.mockResolvedValue({
            id: 't-1'
        });
        await controller.delete('company-1', 't-1');
        (0, _vitest.expect)(service.delete).toHaveBeenCalledWith('company-1', 't-1');
    });
});

//# sourceMappingURL=technicians.controller.spec.js.map