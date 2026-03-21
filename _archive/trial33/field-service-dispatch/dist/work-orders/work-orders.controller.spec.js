"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _workorderscontroller = require("./work-orders.controller");
(0, _vitest.describe)('WorkOrdersController', ()=>{
    let controller;
    let service;
    (0, _vitest.beforeEach)(()=>{
        service = {
            create: _vitest.vi.fn(),
            findAll: _vitest.vi.fn(),
            findOne: _vitest.vi.fn(),
            update: _vitest.vi.fn(),
            transitionStatus: _vitest.vi.fn(),
            autoAssign: _vitest.vi.fn(),
            delete: _vitest.vi.fn()
        };
        controller = new _workorderscontroller.WorkOrdersController(service);
    });
    (0, _vitest.it)('should call service.create with companyId and dto', async ()=>{
        const dto = {
            customerId: 'c-1',
            title: 'Test'
        };
        service.create.mockResolvedValue({
            id: 'wo-1'
        });
        await controller.create('company-1', dto);
        (0, _vitest.expect)(service.create).toHaveBeenCalledWith('company-1', dto);
    });
    (0, _vitest.it)('should call service.findAll with companyId', async ()=>{
        service.findAll.mockResolvedValue([]);
        await controller.findAll('company-1');
        (0, _vitest.expect)(service.findAll).toHaveBeenCalledWith('company-1');
    });
    (0, _vitest.it)('should call service.findOne with companyId and id', async ()=>{
        service.findOne.mockResolvedValue({
            id: 'wo-1'
        });
        await controller.findOne('company-1', 'wo-1');
        (0, _vitest.expect)(service.findOne).toHaveBeenCalledWith('company-1', 'wo-1');
    });
    (0, _vitest.it)('should call service.update', async ()=>{
        service.update.mockResolvedValue({
            id: 'wo-1'
        });
        await controller.update('company-1', 'wo-1', {
            title: 'Updated'
        });
        (0, _vitest.expect)(service.update).toHaveBeenCalledWith('company-1', 'wo-1', {
            title: 'Updated'
        });
    });
    (0, _vitest.it)('should call service.transitionStatus', async ()=>{
        service.transitionStatus.mockResolvedValue({
            id: 'wo-1',
            status: 'ASSIGNED'
        });
        await controller.transitionStatus('company-1', 'wo-1', {
            status: 'ASSIGNED'
        });
        (0, _vitest.expect)(service.transitionStatus).toHaveBeenCalledWith('company-1', 'wo-1', {
            status: 'ASSIGNED'
        });
    });
    (0, _vitest.it)('should call service.autoAssign', async ()=>{
        service.autoAssign.mockResolvedValue({
            id: 'wo-1'
        });
        await controller.autoAssign('company-1', 'wo-1');
        (0, _vitest.expect)(service.autoAssign).toHaveBeenCalledWith('company-1', 'wo-1');
    });
    (0, _vitest.it)('should call service.delete', async ()=>{
        service.delete.mockResolvedValue({
            id: 'wo-1'
        });
        await controller.delete('company-1', 'wo-1');
        (0, _vitest.expect)(service.delete).toHaveBeenCalledWith('company-1', 'wo-1');
    });
});

//# sourceMappingURL=work-orders.controller.spec.js.map