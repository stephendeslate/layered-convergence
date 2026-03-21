"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const common_1 = require("@nestjs/common");
const customer_service_js_1 = require("./customer.service.js");
const mockPrisma = {
    customer: {
        create: vitest_1.vi.fn(),
        findMany: vitest_1.vi.fn(),
        findFirst: vitest_1.vi.fn(),
        update: vitest_1.vi.fn(),
        delete: vitest_1.vi.fn(),
    },
};
(0, vitest_1.describe)('CustomerService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = new customer_service_js_1.CustomerService(mockPrisma);
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(service).toBeDefined();
    });
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('should create a customer', async () => {
            const dto = { companyId: 'c1', name: 'Jane', address: '123 Main' };
            mockPrisma.customer.create.mockResolvedValue({ id: '1', ...dto });
            const result = await service.create(dto);
            (0, vitest_1.expect)(result.name).toBe('Jane');
        });
    });
    (0, vitest_1.describe)('findAllByCompany', () => {
        (0, vitest_1.it)('should return customers for company', async () => {
            mockPrisma.customer.findMany.mockResolvedValue([{ id: '1' }]);
            const result = await service.findAllByCompany('c1');
            (0, vitest_1.expect)(result).toHaveLength(1);
        });
    });
    (0, vitest_1.describe)('findOne', () => {
        (0, vitest_1.it)('should return a customer', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue({ id: '1', name: 'Jane' });
            const result = await service.findOne('1', 'c1');
            (0, vitest_1.expect)(result.name).toBe('Jane');
        });
        (0, vitest_1.it)('should throw NotFoundException when not found', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.findOne('999', 'c1')).rejects.toThrow(common_1.NotFoundException);
        });
        (0, vitest_1.it)('should scope by both id and companyId', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
            await service.findOne('1', 'c1');
            (0, vitest_1.expect)(mockPrisma.customer.findFirst).toHaveBeenCalledWith({
                where: { id: '1', companyId: 'c1' },
            });
        });
    });
    (0, vitest_1.describe)('update', () => {
        (0, vitest_1.it)('should update a customer', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
            mockPrisma.customer.update.mockResolvedValue({ id: '1', name: 'Updated' });
            const result = await service.update('1', 'c1', { name: 'Updated' });
            (0, vitest_1.expect)(result.name).toBe('Updated');
        });
        (0, vitest_1.it)('should throw when not found', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.update('999', 'c1', { name: 'X' })).rejects.toThrow(common_1.NotFoundException);
        });
    });
    (0, vitest_1.describe)('remove', () => {
        (0, vitest_1.it)('should delete a customer', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue({ id: '1' });
            mockPrisma.customer.delete.mockResolvedValue({ id: '1' });
            const result = await service.remove('1', 'c1');
            (0, vitest_1.expect)(result.id).toBe('1');
        });
        (0, vitest_1.it)('should throw when not found', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.remove('999', 'c1')).rejects.toThrow(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=customer.service.spec.js.map