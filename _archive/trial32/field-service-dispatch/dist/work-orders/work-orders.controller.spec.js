"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _workorderscontroller = require("./work-orders.controller");
const _workordersservice = require("./work-orders.service");
const mockService = {
    create: _vitest.vi.fn(),
    findAll: _vitest.vi.fn(),
    findOne: _vitest.vi.fn(),
    update: _vitest.vi.fn(),
    transitionStatus: _vitest.vi.fn(),
    autoAssign: _vitest.vi.fn(),
    delete: _vitest.vi.fn()
};
(0, _vitest.describe)('WorkOrdersController', ()=>{
    let controller;
    (0, _vitest.beforeEach)(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _workorderscontroller.WorkOrdersController
            ],
            providers: [
                {
                    provide: _workordersservice.WorkOrdersService,
                    useValue: mockService
                }
            ]
        }).compile();
        controller = module.get(_workorderscontroller.WorkOrdersController);
        _vitest.vi.clearAllMocks();
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(controller).toBeDefined();
    });
    (0, _vitest.it)('should call create with companyId', async ()=>{
        const dto = {
            customerId: 'c1',
            title: 'Test'
        };
        mockService.create.mockResolvedValue({
            id: '1',
            ...dto
        });
        const result = await controller.create('comp-1', dto);
        (0, _vitest.expect)(mockService.create).toHaveBeenCalledWith('comp-1', dto);
        (0, _vitest.expect)(result.id).toBe('1');
    });
    (0, _vitest.it)('should call findAll with companyId', async ()=>{
        mockService.findAll.mockResolvedValue([]);
        await controller.findAll('comp-1');
        (0, _vitest.expect)(mockService.findAll).toHaveBeenCalledWith('comp-1');
    });
    (0, _vitest.it)('should call findOne with companyId and id', async ()=>{
        mockService.findOne.mockResolvedValue({
            id: '1'
        });
        await controller.findOne('comp-1', '1');
        (0, _vitest.expect)(mockService.findOne).toHaveBeenCalledWith('comp-1', '1');
    });
    (0, _vitest.it)('should call transitionStatus', async ()=>{
        const dto = {
            status: 'ASSIGNED'
        };
        mockService.transitionStatus.mockResolvedValue({
            id: '1',
            status: 'ASSIGNED'
        });
        await controller.transitionStatus('comp-1', '1', dto);
        (0, _vitest.expect)(mockService.transitionStatus).toHaveBeenCalledWith('comp-1', '1', dto);
    });
    (0, _vitest.it)('should call autoAssign', async ()=>{
        mockService.autoAssign.mockResolvedValue({
            id: '1'
        });
        await controller.autoAssign('comp-1', '1');
        (0, _vitest.expect)(mockService.autoAssign).toHaveBeenCalledWith('comp-1', '1');
    });
    (0, _vitest.it)('should call delete', async ()=>{
        mockService.delete.mockResolvedValue({
            id: '1'
        });
        await controller.delete('comp-1', '1');
        (0, _vitest.expect)(mockService.delete).toHaveBeenCalledWith('comp-1', '1');
    });
});

//# sourceMappingURL=work-orders.controller.spec.js.map