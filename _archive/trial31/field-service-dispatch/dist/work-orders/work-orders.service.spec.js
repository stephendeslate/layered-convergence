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
        _vitest.vi.clearAllMocks();
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a work order with UNASSIGNED status when no technician', async ()=>{
            const dto = {
                customerId: 'cust-1',
                title: 'Fix sink'
            };
            mockPrisma.workOrder.create.mockResolvedValue({
                id: 'wo-1',
                ...dto,
                status: 'UNASSIGNED'
            });
            const result = await service.create('comp-1', dto);
            (0, _vitest.expect)(result.status).toBe('UNASSIGNED');
            (0, _vitest.expect)(mockPrisma.workOrder.create).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                data: _vitest.expect.objectContaining({
                    companyId: 'comp-1',
                    status: 'UNASSIGNED'
                })
            }));
        });
        (0, _vitest.it)('should create with ASSIGNED status when technicianId provided', async ()=>{
            const dto = {
                customerId: 'cust-1',
                title: 'Fix sink',
                technicianId: 'tech-1'
            };
            mockPrisma.workOrder.create.mockResolvedValue({
                id: 'wo-1',
                ...dto,
                status: 'ASSIGNED'
            });
            const result = await service.create('comp-1', dto);
            (0, _vitest.expect)(result.status).toBe('ASSIGNED');
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return work orders for company', async ()=>{
            mockPrisma.workOrder.findMany.mockResolvedValue([
                {
                    id: 'wo-1'
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
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return work order when found', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1'
            });
            const result = await service.findOne('comp-1', 'wo-1');
            (0, _vitest.expect)(result.id).toBe('wo-1');
        });
        (0, _vitest.it)('should throw NotFoundException when not found', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('comp-1', 'wo-1')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('transitionStatus', ()=>{
        (0, _vitest.it)('should transition status and create history', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1',
                status: 'UNASSIGNED',
                customer: {}
            });
            const updated = {
                id: 'wo-1',
                status: 'ASSIGNED'
            };
            mockPrisma.$transaction.mockResolvedValue([
                updated,
                {}
            ]);
            const result = await service.transitionStatus('comp-1', 'wo-1', {
                status: 'ASSIGNED'
            });
            (0, _vitest.expect)(result.status).toBe('ASSIGNED');
        });
        (0, _vitest.it)('should throw BadRequestException for invalid transition', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1',
                status: 'UNASSIGNED',
                customer: {}
            });
            await (0, _vitest.expect)(service.transitionStatus('comp-1', 'wo-1', {
                status: 'COMPLETED'
            })).rejects.toThrow(_common.BadRequestException);
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete work order', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1'
            });
            mockPrisma.workOrder.delete.mockResolvedValue({
                id: 'wo-1'
            });
            const result = await service.delete('comp-1', 'wo-1');
            (0, _vitest.expect)(result.id).toBe('wo-1');
        });
    });
    (0, _vitest.describe)('autoAssign', ()=>{
        (0, _vitest.it)('should assign nearest technician', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1',
                status: 'UNASSIGNED',
                customer: {
                    lat: 40.0,
                    lng: -74.0
                }
            });
            mockPrisma.technician.findMany.mockResolvedValue([
                {
                    id: 'tech-1',
                    name: 'Alice',
                    currentLat: 40.1,
                    currentLng: -74.1
                },
                {
                    id: 'tech-2',
                    name: 'Bob',
                    currentLat: 40.5,
                    currentLng: -74.5
                }
            ]);
            const updated = {
                id: 'wo-1',
                status: 'ASSIGNED',
                technicianId: 'tech-1'
            };
            mockPrisma.$transaction.mockResolvedValue([
                updated,
                {}
            ]);
            const result = await service.autoAssign('comp-1', 'wo-1');
            (0, _vitest.expect)(result.status).toBe('ASSIGNED');
            (0, _vitest.expect)(result.technicianId).toBe('tech-1');
        });
        (0, _vitest.it)('should return unchanged if status is not UNASSIGNED', async ()=>{
            const wo = {
                id: 'wo-1',
                status: 'ASSIGNED',
                customer: {}
            };
            mockPrisma.workOrder.findFirst.mockResolvedValue(wo);
            const result = await service.autoAssign('comp-1', 'wo-1');
            (0, _vitest.expect)(result.status).toBe('ASSIGNED');
        });
        (0, _vitest.it)('should return unchanged if no available technicians', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1',
                status: 'UNASSIGNED',
                customer: {
                    lat: 40.0,
                    lng: -74.0
                }
            });
            mockPrisma.technician.findMany.mockResolvedValue([]);
            const result = await service.autoAssign('comp-1', 'wo-1');
            (0, _vitest.expect)(result.status).toBe('UNASSIGNED');
        });
    });
});

//# sourceMappingURL=work-orders.service.spec.js.map