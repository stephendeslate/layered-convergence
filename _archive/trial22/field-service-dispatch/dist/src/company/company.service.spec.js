"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const common_1 = require("@nestjs/common");
const company_service_js_1 = require("./company.service.js");
const mockPrisma = {
    company: {
        create: vitest_1.vi.fn(),
        findMany: vitest_1.vi.fn(),
        findUnique: vitest_1.vi.fn(),
        update: vitest_1.vi.fn(),
        delete: vitest_1.vi.fn(),
    },
};
(0, vitest_1.describe)('CompanyService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = new company_service_js_1.CompanyService(mockPrisma);
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(service).toBeDefined();
    });
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('should create a company', async () => {
            mockPrisma.company.create.mockResolvedValue({ id: '1', name: 'Test Co' });
            const result = await service.create({ name: 'Test Co' });
            (0, vitest_1.expect)(result.name).toBe('Test Co');
        });
        (0, vitest_1.it)('should pass optional fields', async () => {
            const dto = { name: 'Co', serviceArea: 'NYC', primaryColor: '#000' };
            mockPrisma.company.create.mockResolvedValue({ id: '1', ...dto });
            const result = await service.create(dto);
            (0, vitest_1.expect)(result.serviceArea).toBe('NYC');
        });
    });
    (0, vitest_1.describe)('findAll', () => {
        (0, vitest_1.it)('should return all companies', async () => {
            mockPrisma.company.findMany.mockResolvedValue([{ id: '1' }, { id: '2' }]);
            const result = await service.findAll();
            (0, vitest_1.expect)(result).toHaveLength(2);
        });
        (0, vitest_1.it)('should return empty array when no companies', async () => {
            mockPrisma.company.findMany.mockResolvedValue([]);
            const result = await service.findAll();
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)('findOne', () => {
        (0, vitest_1.it)('should return a company by id', async () => {
            mockPrisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Test' });
            const result = await service.findOne('1');
            (0, vitest_1.expect)(result.name).toBe('Test');
        });
        (0, vitest_1.it)('should throw NotFoundException when not found', async () => {
            mockPrisma.company.findUnique.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.findOne('999')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    (0, vitest_1.describe)('update', () => {
        (0, vitest_1.it)('should update a company', async () => {
            mockPrisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Old' });
            mockPrisma.company.update.mockResolvedValue({ id: '1', name: 'New' });
            const result = await service.update('1', { name: 'New' });
            (0, vitest_1.expect)(result.name).toBe('New');
        });
        (0, vitest_1.it)('should throw NotFoundException if company not found', async () => {
            mockPrisma.company.findUnique.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.update('999', { name: 'X' })).rejects.toThrow(common_1.NotFoundException);
        });
    });
    (0, vitest_1.describe)('remove', () => {
        (0, vitest_1.it)('should delete a company', async () => {
            mockPrisma.company.findUnique.mockResolvedValue({ id: '1' });
            mockPrisma.company.delete.mockResolvedValue({ id: '1' });
            const result = await service.remove('1');
            (0, vitest_1.expect)(result.id).toBe('1');
        });
        (0, vitest_1.it)('should throw NotFoundException if company not found', async () => {
            mockPrisma.company.findUnique.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.remove('999')).rejects.toThrow(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=company.service.spec.js.map