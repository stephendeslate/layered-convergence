"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _workordersservice = require("./work-orders.service");
const _common = require("@nestjs/common");
(0, _vitest.describe)('WorkOrdersService', ()=>{
    let service;
    let prisma;
    const companyId = 'company-1';
    (0, _vitest.beforeEach)(()=>{
        prisma = {
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
        service = new _workordersservice.WorkOrdersService(prisma);
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create work order with UNASSIGNED status when no technician', async ()=>{
            const dto = {
                customerId: 'cust-1',
                title: 'Fix AC'
            };
            prisma.workOrder.create.mockResolvedValue({
                id: 'wo-1',
                status: 'UNASSIGNED',
                companyId
            });
            const result = await service.create(companyId, dto);
            (0, _vitest.expect)(result.status).toBe('UNASSIGNED');
            (0, _vitest.expect)(prisma.workOrder.create).toHaveBeenCalledWith({
                data: _vitest.expect.objectContaining({
                    status: 'UNASSIGNED'
                }),
                include: {
                    customer: true,
                    technician: true
                }
            });
        });
        (0, _vitest.it)('should create work order with ASSIGNED status when technician provided', async ()=>{
            const dto = {
                customerId: 'cust-1',
                title: 'Fix AC',
                technicianId: 'tech-1'
            };
            prisma.workOrder.create.mockResolvedValue({
                id: 'wo-1',
                status: 'ASSIGNED',
                technicianId: 'tech-1'
            });
            const result = await service.create(companyId, dto);
            (0, _vitest.expect)(result.status).toBe('ASSIGNED');
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return work orders for company', async ()=>{
            prisma.workOrder.findMany.mockResolvedValue([
                {
                    id: 'wo-1'
                }
            ]);
            const result = await service.findAll(companyId);
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return a work order', async ()=>{
            prisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1'
            });
            const result = await service.findOne(companyId, 'wo-1');
            (0, _vitest.expect)(result.id).toBe('wo-1');
        });
        (0, _vitest.it)('should throw NotFoundException when not found', async ()=>{
            prisma.workOrder.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne(companyId, 'nope')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update a work order', async ()=>{
            prisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1'
            });
            prisma.workOrder.update.mockResolvedValue({
                id: 'wo-1',
                title: 'Updated'
            });
            const result = await service.update(companyId, 'wo-1', {
                title: 'Updated'
            });
            (0, _vitest.expect)(result.title).toBe('Updated');
        });
    });
    (0, _vitest.describe)('transitionStatus', ()=>{
        (0, _vitest.it)('should transition status and create history record', async ()=>{
            prisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1',
                status: 'UNASSIGNED'
            });
            prisma.$transaction.mockResolvedValue([
                {
                    id: 'wo-1',
                    status: 'ASSIGNED'
                },
                {
                    id: 'hist-1'
                }
            ]);
            const result = await service.transitionStatus(companyId, 'wo-1', {
                status: 'ASSIGNED'
            });
            (0, _vitest.expect)(result.status).toBe('ASSIGNED');
            (0, _vitest.expect)(prisma.$transaction).toHaveBeenCalled();
        });
        (0, _vitest.it)('should throw BadRequestException for invalid transition', async ()=>{
            prisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1',
                status: 'UNASSIGNED'
            });
            await (0, _vitest.expect)(service.transitionStatus(companyId, 'wo-1', {
                status: 'COMPLETED'
            })).rejects.toThrow(_common.BadRequestException);
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete a work order', async ()=>{
            prisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1'
            });
            prisma.workOrder.delete.mockResolvedValue({
                id: 'wo-1'
            });
            const result = await service.delete(companyId, 'wo-1');
            (0, _vitest.expect)(result.id).toBe('wo-1');
        });
    });
    (0, _vitest.describe)('autoAssign', ()=>{
        (0, _vitest.it)('should auto-assign nearest available technician', async ()=>{
            prisma.workOrder.findFirst.mockResolvedValue({
                id: 'wo-1',
                status: 'UNASSIGNED',
                customer: {
                    lat: 40.0,
                    lng: -74.0
                }
            });
            prisma.technician.findMany.mockResolvedValue([
                {
                    id: 'tech-1',
                    currentLat: 40.1,
                    currentLng: -74.1,
                    name: 'Tech 1'
                },
                {
                    id: 'tech-2',
                    currentLat: 40.0,
                    currentLng: -74.0,
                    name: 'Tech 2'
                }
            ]);
            prisma.$transaction.mockResolvedValue([
                {
                    id: 'wo-1',
                    status: 'ASSIGNED',
                    technicianId: 'tech-2'
                },
                {
                    id: 'hist-1'
                }
            ]);
            const result = await service.autoAssign(companyId, 'wo-1');
            (0, _vitest.expect)(result.status).toBe('ASSIGNED');
        });
        (0, _vitest.it)('should return unchanged work order when status is not UNASSIGNED', async ()=>{
            const workOrder = {
                id: 'wo-1',
                status: 'ASSIGNED',
                customer: {}
            };
            prisma.workOrder.findFirst.mockResolvedValue(workOrder);
            const result = await service.autoAssign(companyId, 'wo-1');
            (0, _vitest.expect)(result).toEqual(workOrder);
        });
        (0, _vitest.it)('should return unchanged work order when customer has no coordinates', async ()=>{
            const workOrder = {
                id: 'wo-1',
                status: 'UNASSIGNED',
                customer: {
                    lat: null,
                    lng: null
                }
            };
            prisma.workOrder.findFirst.mockResolvedValue(workOrder);
            const result = await service.autoAssign(companyId, 'wo-1');
            (0, _vitest.expect)(result).toEqual(workOrder);
        });
        (0, _vitest.it)('should return unchanged work order when no technicians available', async ()=>{
            const workOrder = {
                id: 'wo-1',
                status: 'UNASSIGNED',
                customer: {
                    lat: 40.0,
                    lng: -74.0
                }
            };
            prisma.workOrder.findFirst.mockResolvedValue(workOrder);
            prisma.technician.findMany.mockResolvedValue([]);
            const result = await service.autoAssign(companyId, 'wo-1');
            (0, _vitest.expect)(result).toEqual(workOrder);
        });
    });
});

//# sourceMappingURL=work-orders.service.spec.js.map