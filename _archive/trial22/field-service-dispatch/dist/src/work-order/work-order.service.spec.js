"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const common_1 = require("@nestjs/common");
const work_order_service_js_1 = require("./work-order.service.js");
const mockPrisma = {
    workOrder: {
        create: vitest_1.vi.fn(),
        findMany: vitest_1.vi.fn(),
        findFirst: vitest_1.vi.fn(),
        update: vitest_1.vi.fn(),
    },
    workOrderStatusHistory: {
        create: vitest_1.vi.fn(),
    },
    technician: {
        findMany: vitest_1.vi.fn(),
    },
    $transaction: vitest_1.vi.fn(),
};
(0, vitest_1.describe)('WorkOrderService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = new work_order_service_js_1.WorkOrderService(mockPrisma);
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(service).toBeDefined();
    });
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('should create UNASSIGNED work order without technicianId', async () => {
            const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix leak' };
            mockPrisma.workOrder.create.mockResolvedValue({ id: '1', status: 'UNASSIGNED', ...dto });
            const result = await service.create(dto);
            (0, vitest_1.expect)(result.status).toBe('UNASSIGNED');
        });
        (0, vitest_1.it)('should create ASSIGNED work order with technicianId', async () => {
            const dto = { companyId: 'c1', customerId: 'cu1', technicianId: 't1', description: 'Fix leak' };
            mockPrisma.workOrder.create.mockResolvedValue({ id: '1', status: 'ASSIGNED', ...dto });
            const result = await service.create(dto);
            (0, vitest_1.expect)(result.status).toBe('ASSIGNED');
        });
        (0, vitest_1.it)('should pass scheduledAt as Date when provided', async () => {
            const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix', scheduledAt: '2024-01-01T10:00:00Z' };
            mockPrisma.workOrder.create.mockResolvedValue({ id: '1', ...dto });
            await service.create(dto);
            (0, vitest_1.expect)(mockPrisma.workOrder.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                data: vitest_1.expect.objectContaining({
                    scheduledAt: vitest_1.expect.any(Date),
                }),
            }));
        });
        (0, vitest_1.it)('should set priority when provided', async () => {
            const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix', priority: 'HIGH' };
            mockPrisma.workOrder.create.mockResolvedValue({ id: '1', ...dto, status: 'UNASSIGNED' });
            await service.create(dto);
            (0, vitest_1.expect)(mockPrisma.workOrder.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                data: vitest_1.expect.objectContaining({ priority: 'HIGH' }),
            }));
        });
        (0, vitest_1.it)('should set notes when provided', async () => {
            const dto = { companyId: 'c1', customerId: 'cu1', description: 'Fix', notes: 'Urgent' };
            mockPrisma.workOrder.create.mockResolvedValue({ id: '1', ...dto, status: 'UNASSIGNED' });
            await service.create(dto);
            (0, vitest_1.expect)(mockPrisma.workOrder.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                data: vitest_1.expect.objectContaining({ notes: 'Urgent' }),
            }));
        });
    });
    (0, vitest_1.describe)('findAllByCompany', () => {
        (0, vitest_1.it)('should return work orders scoped to company', async () => {
            mockPrisma.workOrder.findMany.mockResolvedValue([{ id: '1' }]);
            const result = await service.findAllByCompany('c1');
            (0, vitest_1.expect)(result).toHaveLength(1);
        });
    });
    (0, vitest_1.describe)('findOne', () => {
        (0, vitest_1.it)('should return a work order', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'UNASSIGNED' });
            const result = await service.findOne('1', 'c1');
            (0, vitest_1.expect)(result.status).toBe('UNASSIGNED');
        });
        (0, vitest_1.it)('should throw NotFoundException when not found', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.findOne('999', 'c1')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    (0, vitest_1.describe)('transition', () => {
        (0, vitest_1.it)('should allow valid transition UNASSIGNED -> ASSIGNED', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'UNASSIGNED', customer: {}, technician: null, statusHistory: [],
            });
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED' }, {}]);
            const result = await service.transition('1', 'c1', 'ASSIGNED', { technicianId: 't1' });
            (0, vitest_1.expect)(result.status).toBe('ASSIGNED');
        });
        (0, vitest_1.it)('should reject invalid transition UNASSIGNED -> COMPLETED', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'UNASSIGNED', customer: {}, technician: null, statusHistory: [],
            });
            await (0, vitest_1.expect)(service.transition('1', 'c1', 'COMPLETED')).rejects.toThrow(common_1.BadRequestException);
        });
        (0, vitest_1.it)('should reject transition from PAID (terminal state)', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'PAID', customer: {}, technician: null, statusHistory: [],
            });
            await (0, vitest_1.expect)(service.transition('1', 'c1', 'COMPLETED')).rejects.toThrow(common_1.BadRequestException);
        });
        (0, vitest_1.it)('should allow back-transition ASSIGNED -> UNASSIGNED', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'ASSIGNED', customer: {}, technician: null, statusHistory: [],
            });
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'UNASSIGNED', technicianId: null }, {}]);
            const result = await service.transition('1', 'c1', 'UNASSIGNED');
            (0, vitest_1.expect)(result.technicianId).toBeNull();
        });
        (0, vitest_1.it)('should allow back-transition EN_ROUTE -> ASSIGNED', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'EN_ROUTE', customer: {}, technician: null, statusHistory: [],
            });
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED' }, {}]);
            const result = await service.transition('1', 'c1', 'ASSIGNED');
            (0, vitest_1.expect)(result.status).toBe('ASSIGNED');
        });
        (0, vitest_1.it)('should set completedAt when transitioning to COMPLETED', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'IN_PROGRESS', customer: {}, technician: null, statusHistory: [],
            });
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'COMPLETED', completedAt: new Date() }, {}]);
            await service.transition('1', 'c1', 'COMPLETED');
            const txCall = mockPrisma.$transaction.mock.calls[0][0];
            (0, vitest_1.expect)(txCall).toHaveLength(2);
        });
        (0, vitest_1.it)('should include error message with from and to status on invalid transition', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'UNASSIGNED', customer: {}, technician: null, statusHistory: [],
            });
            try {
                await service.transition('1', 'c1', 'PAID');
            }
            catch (err) {
                (0, vitest_1.expect)(err.message).toContain('UNASSIGNED');
                (0, vitest_1.expect)(err.message).toContain('PAID');
            }
        });
        (0, vitest_1.it)('should allow ASSIGNED -> EN_ROUTE', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'ASSIGNED', customer: {}, technician: null, statusHistory: [],
            });
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'EN_ROUTE' }, {}]);
            const result = await service.transition('1', 'c1', 'EN_ROUTE');
            (0, vitest_1.expect)(result.status).toBe('EN_ROUTE');
        });
        (0, vitest_1.it)('should allow EN_ROUTE -> ON_SITE', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'EN_ROUTE', customer: {}, technician: null, statusHistory: [],
            });
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ON_SITE' }, {}]);
            const result = await service.transition('1', 'c1', 'ON_SITE');
            (0, vitest_1.expect)(result.status).toBe('ON_SITE');
        });
        (0, vitest_1.it)('should allow ON_SITE -> IN_PROGRESS', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'ON_SITE', customer: {}, technician: null, statusHistory: [],
            });
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'IN_PROGRESS' }, {}]);
            const result = await service.transition('1', 'c1', 'IN_PROGRESS');
            (0, vitest_1.expect)(result.status).toBe('IN_PROGRESS');
        });
        (0, vitest_1.it)('should allow COMPLETED -> INVOICED', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'COMPLETED', customer: {}, technician: null, statusHistory: [],
            });
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'INVOICED' }, {}]);
            const result = await service.transition('1', 'c1', 'INVOICED');
            (0, vitest_1.expect)(result.status).toBe('INVOICED');
        });
        (0, vitest_1.it)('should allow INVOICED -> PAID', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'INVOICED', customer: {}, technician: null, statusHistory: [],
            });
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'PAID' }, {}]);
            const result = await service.transition('1', 'c1', 'PAID');
            (0, vitest_1.expect)(result.status).toBe('PAID');
        });
    });
    (0, vitest_1.describe)('assign', () => {
        (0, vitest_1.it)('should delegate to transition with ASSIGNED status', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1', status: 'UNASSIGNED', customer: {}, technician: null, statusHistory: [],
            });
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED' }, {}]);
            const result = await service.assign('1', 'c1', 't1');
            (0, vitest_1.expect)(result.status).toBe('ASSIGNED');
        });
    });
    (0, vitest_1.describe)('autoAssign', () => {
        (0, vitest_1.it)('should auto-assign to nearest available technician', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1',
                status: 'UNASSIGNED',
                customer: { lat: 40.7128, lng: -74.006 },
                technician: null,
                statusHistory: [],
            });
            mockPrisma.technician.findMany.mockResolvedValue([
                { id: 't1', currentLat: 40.8, currentLng: -73.9 },
                { id: 't2', currentLat: 40.72, currentLng: -74.01 },
            ]);
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED', technicianId: 't2' }, {}]);
            const result = await service.autoAssign('1', 'c1');
            (0, vitest_1.expect)(result.status).toBe('ASSIGNED');
        });
        (0, vitest_1.it)('should throw when no available technicians', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1',
                status: 'UNASSIGNED',
                customer: { lat: 40.7, lng: -74.0 },
                technician: null,
                statusHistory: [],
            });
            mockPrisma.technician.findMany.mockResolvedValue([]);
            await (0, vitest_1.expect)(service.autoAssign('1', 'c1')).rejects.toThrow(common_1.BadRequestException);
        });
        (0, vitest_1.it)('should throw when work order is not UNASSIGNED', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1',
                status: 'ASSIGNED',
                customer: {},
                technician: null,
                statusHistory: [],
            });
            await (0, vitest_1.expect)(service.autoAssign('1', 'c1')).rejects.toThrow(common_1.BadRequestException);
        });
        (0, vitest_1.it)('should pick first technician when customer has no coordinates', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1',
                status: 'UNASSIGNED',
                customer: { lat: null, lng: null },
                technician: null,
                statusHistory: [],
            });
            mockPrisma.technician.findMany.mockResolvedValue([
                { id: 't1', currentLat: 40.8, currentLng: -73.9 },
            ]);
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED', technicianId: 't1' }, {}]);
            const result = await service.autoAssign('1', 'c1');
            (0, vitest_1.expect)(result.status).toBe('ASSIGNED');
        });
        (0, vitest_1.it)('should handle technicians without coordinates', async () => {
            mockPrisma.workOrder.findFirst.mockResolvedValue({
                id: '1',
                status: 'UNASSIGNED',
                customer: { lat: 40.7, lng: -74.0 },
                technician: null,
                statusHistory: [],
            });
            mockPrisma.technician.findMany.mockResolvedValue([
                { id: 't1', currentLat: null, currentLng: null },
            ]);
            mockPrisma.$transaction.mockResolvedValue([{ id: '1', status: 'ASSIGNED', technicianId: 't1' }, {}]);
            const result = await service.autoAssign('1', 'c1');
            (0, vitest_1.expect)(result.status).toBe('ASSIGNED');
        });
    });
});
//# sourceMappingURL=work-order.service.spec.js.map