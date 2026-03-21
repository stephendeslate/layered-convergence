"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const common_1 = require("@nestjs/common");
const route_service_js_1 = require("./route.service.js");
const mockPrisma = {
    route: {
        create: vitest_1.vi.fn(),
        findMany: vitest_1.vi.fn(),
        findUnique: vitest_1.vi.fn(),
        update: vitest_1.vi.fn(),
    },
};
(0, vitest_1.describe)('RouteService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = new route_service_js_1.RouteService(mockPrisma);
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(service).toBeDefined();
    });
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('should create a route', async () => {
            const dto = {
                technicianId: 't1',
                date: '2024-01-01',
                waypoints: [{ lat: 40.7, lng: -74.0 }],
            };
            mockPrisma.route.create.mockResolvedValue({ id: '1', ...dto });
            const result = await service.create(dto);
            (0, vitest_1.expect)(result.technicianId).toBe('t1');
        });
        (0, vitest_1.it)('should convert date string to Date', async () => {
            const dto = { technicianId: 't1', date: '2024-06-15', waypoints: [] };
            mockPrisma.route.create.mockResolvedValue({ id: '1' });
            await service.create(dto);
            (0, vitest_1.expect)(mockPrisma.route.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                data: vitest_1.expect.objectContaining({
                    date: vitest_1.expect.any(Date),
                }),
            }));
        });
        (0, vitest_1.it)('should pass estimatedDuration when provided', async () => {
            const dto = { technicianId: 't1', date: '2024-01-01', waypoints: [], estimatedDuration: 120 };
            mockPrisma.route.create.mockResolvedValue({ id: '1' });
            await service.create(dto);
            (0, vitest_1.expect)(mockPrisma.route.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                data: vitest_1.expect.objectContaining({ estimatedDuration: 120 }),
            }));
        });
    });
    (0, vitest_1.describe)('findByTechnician', () => {
        (0, vitest_1.it)('should return routes for technician', async () => {
            mockPrisma.route.findMany.mockResolvedValue([{ id: '1' }]);
            const result = await service.findByTechnician('t1');
            (0, vitest_1.expect)(result).toHaveLength(1);
        });
        (0, vitest_1.it)('should order by date descending', async () => {
            mockPrisma.route.findMany.mockResolvedValue([]);
            await service.findByTechnician('t1');
            (0, vitest_1.expect)(mockPrisma.route.findMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                orderBy: { date: 'desc' },
            }));
        });
    });
    (0, vitest_1.describe)('findOne', () => {
        (0, vitest_1.it)('should return a route', async () => {
            mockPrisma.route.findUnique.mockResolvedValue({ id: '1' });
            const result = await service.findOne('1');
            (0, vitest_1.expect)(result.id).toBe('1');
        });
        (0, vitest_1.it)('should throw NotFoundException when not found', async () => {
            mockPrisma.route.findUnique.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.findOne('999')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    (0, vitest_1.describe)('optimize', () => {
        (0, vitest_1.it)('should reverse waypoints as optimization', async () => {
            const waypoints = [
                { lat: 40.7, lng: -74.0, label: 'A' },
                { lat: 40.8, lng: -73.9, label: 'B' },
            ];
            mockPrisma.route.findUnique.mockResolvedValue({ id: '1', waypoints });
            mockPrisma.route.update.mockResolvedValue({
                id: '1',
                optimizedOrder: [...waypoints].reverse(),
            });
            const result = await service.optimize('1');
            (0, vitest_1.expect)(result.optimizedOrder).toBeDefined();
        });
        (0, vitest_1.it)('should throw when route not found', async () => {
            mockPrisma.route.findUnique.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.optimize('999')).rejects.toThrow(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=route.service.spec.js.map