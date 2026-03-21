"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _workordersservice = require("./work-orders.service");
const _prismaservice = require("../prisma/prisma.service");
const mockPrisma = {
    workOrder: {
        create: _vitest.vi.fn(),
        findMany: _vitest.vi.fn(),
        findFirst: _vitest.vi.fn(),
        update: _vitest.vi.fn(),
        delete: _vitest.vi.fn()
    },
    workOrderStatusHistory: {
        create: _vitest.vi.fn()
    },
    technician: {
        findMany: _vitest.vi.fn()
    },
    $transaction: _vitest.vi.fn()
};
(0, _vitest.describe)('WorkOrdersService', ()=>{
    let service;
    (0, _vitest.beforeEach)(async ()=>{
        _vitest.vi.clearAllMocks();
        const module = await _testing.Test.createTestingModule({
            providers: [
                _workordersservice.WorkOrdersService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_workordersservice.WorkOrdersService);
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(service).toBeDefined();
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create with UNASSIGNED status when no technician', async ()=>{
            mockPrisma.workOrder.create.mockResolvedValue({
                id: '1',
                status: 'UNASSIGNED',
                title: 'Test'
            });
            const result = await service.create('comp-1', {
                customerId: 'cust-1',
                title: 'Test'
            });
            (0, _vitest.expect)(mockPrisma.workOrder.create).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                data: _vitest.expect.objectContaining({
                    status: 'UNASSIGNED'
                })
            }));
            (0, _vitest.expect)(result.status).toBe('UNASSIGNED');
        });
        (0, _vitest.it)('should create with ASSIGNED status when technician provided', async ()=>{
            mockPrisma.workOrder.create.mockResolvedValue({
                id: '1',
                status: 'ASSIGNED'
            });
            await service.create('comp-1', {
                customerId: 'cust-1',
                title: 'Test',
                technicianId: 'tech-1'
            });
            (0, _vitest.expect)(mockPrisma.workOrder.create).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                data: _vitest.expect.objectContaining({
                    status: 'ASSIGNED'
                })
            }));
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return all work orders for a company', async ()=>{
            mockPrisma.workOrder.findMany.mockResolvedValue([
                {
                    id: '1',
                    title: 'WO1'
                }
            ]);
            const result = await service.findAll('comp-1');
            (0, _vitest.expect)(result).toHaveLength(1);
            (0, _vitest.expect)(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                where: {
                    companyId: 'comp-1'
                }
            }));
        });
        (0, _vitest.it)('should filter by status', async ()=>{
            mockPrisma.workOrder.findMany.mockResolvedValue([]);
            await service.findAll('comp-1', 'ASSIGNED');
            (0, _vitest.expect)(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                where: {
                    companyId: 'comp-1',
                    status: 'ASSIGNED'
                }
            }));
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return a work order', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1',
                title: 'Test'
            });
            const result = await service.findOne('comp-1', '1');
            (0, _vitest.expect)(result.id).toBe('1');
        });
        (0, _vitest.it)('should throw NotFoundException when not found', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('comp-1', 'bad-id')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('transitionStatus', ()=>{
        (0, _vitest.it)('should throw BadRequestException for invalid transition', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1',
                status: 'UNASSIGNED',
                customer: {}
            });
            await (0, _vitest.expect)(service.transitionStatus('comp-1', '1', 'COMPLETED')).rejects.toThrow(_common.BadRequestException);
        });
        (0, _vitest.it)('should transition with valid status', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1',
                status: 'ASSIGNED',
                customer: {},
                technician: {}
            });
            mockPrisma.$transaction.mockResolvedValue([
                {
                    id: '1',
                    status: 'EN_ROUTE'
                },
                {}
            ]);
            const result = await service.transitionStatus('comp-1', '1', 'EN_ROUTE', 'Going now');
            (0, _vitest.expect)(result.status).toBe('EN_ROUTE');
        });
    });
    (0, _vitest.describe)('autoAssign', ()=>{
        (0, _vitest.it)('should throw if work order is not UNASSIGNED', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1',
                status: 'ASSIGNED',
                customer: {}
            });
            await (0, _vitest.expect)(service.autoAssign('comp-1', '1')).rejects.toThrow(_common.BadRequestException);
        });
        (0, _vitest.it)('should throw if no available technicians', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1',
                status: 'UNASSIGNED',
                customer: {
                    lat: 40.0,
                    lng: -74.0
                }
            });
            mockPrisma.technician.findMany.mockResolvedValue([]);
            await (0, _vitest.expect)(service.autoAssign('comp-1', '1')).rejects.toThrow(_common.BadRequestException);
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete a work order', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1'
            });
            mockPrisma.workOrder.delete.mockResolvedValue({
                id: '1'
            });
            const result = await service.delete('comp-1', '1');
            (0, _vitest.expect)(result.id).toBe('1');
        });
        (0, _vitest.it)('should throw NotFoundException if work order does not exist', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.delete('comp-1', 'bad')).rejects.toThrow(_common.NotFoundException);
        });
    });
});

//# sourceMappingURL=work-orders.service.spec.js.map