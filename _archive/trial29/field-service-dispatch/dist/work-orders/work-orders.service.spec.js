"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
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
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a work order with UNASSIGNED status when no technicianId', async ()=>{
            const dto = {
                title: 'Fix AC',
                description: 'AC broken',
                customerId: 'c1',
                priority: 'HIGH'
            };
            mockPrisma.workOrder.create.mockResolvedValue({
                id: 'wo1',
                ...dto,
                status: 'UNASSIGNED'
            });
            const result = await service.create('comp1', dto);
            (0, _vitest.expect)(mockPrisma.workOrder.create).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                data: _vitest.expect.objectContaining({
                    status: _client.WorkOrderStatus.UNASSIGNED
                })
            }));
            (0, _vitest.expect)(result.id).toBe('wo1');
        });
        (0, _vitest.it)('should create with ASSIGNED status when technicianId provided', async ()=>{
            const dto = {
                title: 'Fix AC',
                description: 'AC broken',
                customerId: 'c1',
                technicianId: 't1',
                priority: 'HIGH'
            };
            mockPrisma.workOrder.create.mockResolvedValue({
                id: 'wo1',
                status: 'ASSIGNED'
            });
            await service.create('comp1', dto);
            (0, _vitest.expect)(mockPrisma.workOrder.create).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                data: _vitest.expect.objectContaining({
                    status: _client.WorkOrderStatus.ASSIGNED
                })
            }));
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return all work orders for a company', async ()=>{
            mockPrisma.workOrder.findMany.mockResolvedValue([
                {
                    id: 'wo1'
                }
            ]);
            const result = await service.findAll('comp1');
            (0, _vitest.expect)(result).toHaveLength(1);
            (0, _vitest.expect)(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                where: {
                    companyId: 'comp1'
                }
            }));
        });
        (0, _vitest.it)('should filter by status when provided', async ()=>{
            mockPrisma.workOrder.findMany.mockResolvedValue([]);
            await service.findAll('comp1', _client.WorkOrderStatus.ASSIGNED);
            (0, _vitest.expect)(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                where: {
                    companyId: 'comp1',
                    status: _client.WorkOrderStatus.ASSIGNED
                }
            }));
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return work order when found', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo1',
                companyId: 'comp1'
            });
            const result = await service.findOne('comp1', 'wo1');
            (0, _vitest.expect)(result.id).toBe('wo1');
        });
        (0, _vitest.it)('should throw NotFoundException when not found', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('comp1', 'wo999')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update work order fields', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo1'
            });
            mockPrisma.workOrder.update.mockResolvedValue({
                id: 'wo1',
                title: 'Updated'
            });
            const result = await service.update('comp1', 'wo1', {
                title: 'Updated'
            });
            (0, _vitest.expect)(result.title).toBe('Updated');
        });
        (0, _vitest.it)('should throw NotFoundException for non-existent work order', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.update('comp1', 'wo999', {
                title: 'x'
            })).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('transitionStatus', ()=>{
        (0, _vitest.it)('should transition status and create history entry', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo1',
                status: _client.WorkOrderStatus.UNASSIGNED,
                customer: {},
                technician: null
            });
            const updated = {
                id: 'wo1',
                status: _client.WorkOrderStatus.ASSIGNED
            };
            mockPrisma.$transaction.mockResolvedValue([
                updated,
                {}
            ]);
            const result = await service.transitionStatus('comp1', 'wo1', _client.WorkOrderStatus.ASSIGNED);
            (0, _vitest.expect)(result.status).toBe(_client.WorkOrderStatus.ASSIGNED);
        });
        (0, _vitest.it)('should throw for invalid transition', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo1',
                status: _client.WorkOrderStatus.UNASSIGNED
            });
            await (0, _vitest.expect)(service.transitionStatus('comp1', 'wo1', _client.WorkOrderStatus.COMPLETED)).rejects.toThrow(_common.BadRequestException);
        });
    });
    (0, _vitest.describe)('assignTechnician', ()=>{
        (0, _vitest.it)('should assign technician to UNASSIGNED work order', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo1',
                status: _client.WorkOrderStatus.UNASSIGNED
            });
            mockPrisma.$transaction.mockResolvedValue([
                {
                    id: 'wo1',
                    technicianId: 't1',
                    status: 'ASSIGNED'
                },
                {}
            ]);
            const result = await service.assignTechnician('comp1', 'wo1', 't1');
            (0, _vitest.expect)(result.technicianId).toBe('t1');
        });
        (0, _vitest.it)('should throw for non-assignable status', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo1',
                status: _client.WorkOrderStatus.COMPLETED
            });
            await (0, _vitest.expect)(service.assignTechnician('comp1', 'wo1', 't1')).rejects.toThrow(_common.BadRequestException);
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete an existing work order', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo1'
            });
            mockPrisma.workOrder.delete.mockResolvedValue({
                id: 'wo1'
            });
            const result = await service.delete('comp1', 'wo1');
            (0, _vitest.expect)(result.id).toBe('wo1');
        });
    });
    (0, _vitest.describe)('autoAssign', ()=>{
        (0, _vitest.it)('should assign the nearest available technician', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo1',
                status: _client.WorkOrderStatus.UNASSIGNED,
                customer: {
                    lat: 10,
                    lng: 20
                }
            });
            mockPrisma.technician.findMany.mockResolvedValue([
                {
                    id: 't1',
                    currentLat: 50,
                    currentLng: 50
                },
                {
                    id: 't2',
                    currentLat: 11,
                    currentLng: 21
                }
            ]);
            mockPrisma.$transaction.mockResolvedValue([
                {
                    id: 'wo1',
                    technicianId: 't2',
                    status: 'ASSIGNED'
                },
                {}
            ]);
            const result = await service.autoAssign('comp1', 'wo1');
            (0, _vitest.expect)(result.technicianId).toBe('t2');
        });
        (0, _vitest.it)('should throw if no available technicians', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo1',
                status: _client.WorkOrderStatus.UNASSIGNED,
                customer: {
                    lat: 10,
                    lng: 20
                }
            });
            mockPrisma.technician.findMany.mockResolvedValue([]);
            await (0, _vitest.expect)(service.autoAssign('comp1', 'wo1')).rejects.toThrow(_common.BadRequestException);
        });
        (0, _vitest.it)('should throw if work order is not UNASSIGNED', async ()=>{
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo1',
                status: _client.WorkOrderStatus.ASSIGNED
            });
            await (0, _vitest.expect)(service.autoAssign('comp1', 'wo1')).rejects.toThrow(_common.BadRequestException);
        });
    });
});

//# sourceMappingURL=work-orders.service.spec.js.map