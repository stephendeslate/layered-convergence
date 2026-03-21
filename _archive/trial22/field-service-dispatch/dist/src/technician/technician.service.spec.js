"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const common_1 = require("@nestjs/common");
const technician_service_js_1 = require("./technician.service.js");
const mockPrisma = {
    technician: {
        create: vitest_1.vi.fn(),
        findMany: vitest_1.vi.fn(),
        findFirst: vitest_1.vi.fn(),
        update: vitest_1.vi.fn(),
        delete: vitest_1.vi.fn(),
    },
};
(0, vitest_1.describe)('TechnicianService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = new technician_service_js_1.TechnicianService(mockPrisma);
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(service).toBeDefined();
    });
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('should create a technician', async () => {
            const dto = { companyId: 'c1', name: 'Bob', email: 'bob@test.com', skills: ['plumbing'] };
            mockPrisma.technician.create.mockResolvedValue({ id: '1', ...dto });
            const result = await service.create(dto);
            (0, vitest_1.expect)(result.name).toBe('Bob');
        });
    });
    (0, vitest_1.describe)('findAllByCompany', () => {
        (0, vitest_1.it)('should return technicians for company', async () => {
            mockPrisma.technician.findMany.mockResolvedValue([{ id: '1' }]);
            const result = await service.findAllByCompany('c1');
            (0, vitest_1.expect)(result).toHaveLength(1);
        });
        (0, vitest_1.it)('should return empty for company with no technicians', async () => {
            mockPrisma.technician.findMany.mockResolvedValue([]);
            const result = await service.findAllByCompany('c2');
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)('findOne', () => {
        (0, vitest_1.it)('should return a technician', async () => {
            mockPrisma.technician.findFirst.mockResolvedValue({ id: '1', name: 'Bob' });
            const result = await service.findOne('1', 'c1');
            (0, vitest_1.expect)(result.name).toBe('Bob');
        });
        (0, vitest_1.it)('should throw NotFoundException when not found', async () => {
            mockPrisma.technician.findFirst.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.findOne('999', 'c1')).rejects.toThrow(common_1.NotFoundException);
        });
        (0, vitest_1.it)('should scope query by both id and companyId', async () => {
            mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
            await service.findOne('1', 'c1');
            (0, vitest_1.expect)(mockPrisma.technician.findFirst).toHaveBeenCalledWith({
                where: { id: '1', companyId: 'c1' },
            });
        });
    });
    (0, vitest_1.describe)('update', () => {
        (0, vitest_1.it)('should update a technician', async () => {
            mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
            mockPrisma.technician.update.mockResolvedValue({ id: '1', name: 'Updated' });
            const result = await service.update('1', 'c1', { name: 'Updated' });
            (0, vitest_1.expect)(result.name).toBe('Updated');
        });
        (0, vitest_1.it)('should throw when not found', async () => {
            mockPrisma.technician.findFirst.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.update('999', 'c1', { name: 'X' })).rejects.toThrow(common_1.NotFoundException);
        });
    });
    (0, vitest_1.describe)('updatePosition', () => {
        (0, vitest_1.it)('should update lat/lng', async () => {
            mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
            mockPrisma.technician.update.mockResolvedValue({ id: '1', currentLat: 40.7, currentLng: -74.0 });
            const result = await service.updatePosition('1', 'c1', 40.7, -74.0);
            (0, vitest_1.expect)(result.currentLat).toBe(40.7);
        });
    });
    (0, vitest_1.describe)('remove', () => {
        (0, vitest_1.it)('should delete a technician', async () => {
            mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
            mockPrisma.technician.delete.mockResolvedValue({ id: '1' });
            const result = await service.remove('1', 'c1');
            (0, vitest_1.expect)(result.id).toBe('1');
        });
    });
});
//# sourceMappingURL=technician.service.spec.js.map