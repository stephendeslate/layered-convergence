"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _client = require("@prisma/client");
const _workorderscontroller = require("./work-orders.controller");
const _workordersservice = require("./work-orders.service");
const mockService = {
    create: _vitest.vi.fn(),
    findAll: _vitest.vi.fn(),
    findOne: _vitest.vi.fn(),
    update: _vitest.vi.fn(),
    transitionStatus: _vitest.vi.fn(),
    assignTechnician: _vitest.vi.fn(),
    autoAssign: _vitest.vi.fn(),
    delete: _vitest.vi.fn()
};
(0, _vitest.describe)('WorkOrdersController', ()=>{
    let controller;
    (0, _vitest.beforeEach)(async ()=>{
        _vitest.vi.clearAllMocks();
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
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(controller).toBeDefined();
    });
    (0, _vitest.it)('should call create with companyId and dto', async ()=>{
        const dto = {
            title: 'Fix AC',
            description: 'AC broken',
            customerId: 'c1'
        };
        mockService.create.mockResolvedValue({
            id: 'wo1'
        });
        const result = await controller.create('comp1', dto);
        (0, _vitest.expect)(mockService.create).toHaveBeenCalledWith('comp1', dto);
        (0, _vitest.expect)(result.id).toBe('wo1');
    });
    (0, _vitest.it)('should call findAll with companyId and optional status', async ()=>{
        mockService.findAll.mockResolvedValue([]);
        await controller.findAll('comp1', _client.WorkOrderStatus.ASSIGNED);
        (0, _vitest.expect)(mockService.findAll).toHaveBeenCalledWith('comp1', _client.WorkOrderStatus.ASSIGNED);
    });
    (0, _vitest.it)('should call findOne with companyId and id', async ()=>{
        mockService.findOne.mockResolvedValue({
            id: 'wo1'
        });
        const result = await controller.findOne('comp1', 'wo1');
        (0, _vitest.expect)(result.id).toBe('wo1');
    });
    (0, _vitest.it)('should call transitionStatus with correct params', async ()=>{
        mockService.transitionStatus.mockResolvedValue({
            id: 'wo1',
            status: 'ASSIGNED'
        });
        await controller.transitionStatus('comp1', 'wo1', {
            status: _client.WorkOrderStatus.ASSIGNED
        });
        (0, _vitest.expect)(mockService.transitionStatus).toHaveBeenCalledWith('comp1', 'wo1', _client.WorkOrderStatus.ASSIGNED, undefined);
    });
    (0, _vitest.it)('should call assignTechnician', async ()=>{
        mockService.assignTechnician.mockResolvedValue({
            id: 'wo1'
        });
        await controller.assignTechnician('comp1', 'wo1', 't1');
        (0, _vitest.expect)(mockService.assignTechnician).toHaveBeenCalledWith('comp1', 'wo1', 't1');
    });
    (0, _vitest.it)('should call autoAssign', async ()=>{
        mockService.autoAssign.mockResolvedValue({
            id: 'wo1'
        });
        await controller.autoAssign('comp1', 'wo1');
        (0, _vitest.expect)(mockService.autoAssign).toHaveBeenCalledWith('comp1', 'wo1');
    });
    (0, _vitest.it)('should call delete', async ()=>{
        mockService.delete.mockResolvedValue({
            id: 'wo1'
        });
        await controller.delete('comp1', 'wo1');
        (0, _vitest.expect)(mockService.delete).toHaveBeenCalledWith('comp1', 'wo1');
    });
});

//# sourceMappingURL=work-orders.controller.spec.js.map