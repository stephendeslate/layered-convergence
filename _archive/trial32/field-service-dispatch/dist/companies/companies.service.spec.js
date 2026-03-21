"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _companiesservice = require("./companies.service");
const _prismaservice = require("../prisma/prisma.service");
const mockPrisma = {
    company: {
        create: _vitest.vi.fn(),
        findMany: _vitest.vi.fn(),
        findUnique: _vitest.vi.fn(),
        update: _vitest.vi.fn(),
        delete: _vitest.vi.fn()
    }
};
(0, _vitest.describe)('CompaniesService', ()=>{
    let service;
    (0, _vitest.beforeEach)(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _companiesservice.CompaniesService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_companiesservice.CompaniesService);
        _vitest.vi.clearAllMocks();
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a company', async ()=>{
            const dto = {
                name: 'Acme',
                slug: 'acme'
            };
            mockPrisma.company.create.mockResolvedValue({
                id: '1',
                ...dto
            });
            const result = await service.create(dto);
            (0, _vitest.expect)(result.name).toBe('Acme');
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return all companies', async ()=>{
            mockPrisma.company.findMany.mockResolvedValue([
                {
                    id: '1'
                }
            ]);
            const result = await service.findAll();
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return company when found', async ()=>{
            mockPrisma.company.findUnique.mockResolvedValue({
                id: '1',
                name: 'Acme'
            });
            const result = await service.findOne('1');
            (0, _vitest.expect)(result.name).toBe('Acme');
        });
        (0, _vitest.it)('should throw NotFoundException when not found', async ()=>{
            mockPrisma.company.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('1')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('findBySlug', ()=>{
        (0, _vitest.it)('should return company by slug', async ()=>{
            mockPrisma.company.findUnique.mockResolvedValue({
                id: '1',
                slug: 'acme'
            });
            const result = await service.findBySlug('acme');
            (0, _vitest.expect)(result.slug).toBe('acme');
        });
        (0, _vitest.it)('should throw NotFoundException when slug not found', async ()=>{
            mockPrisma.company.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findBySlug('unknown')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update company', async ()=>{
            mockPrisma.company.findUnique.mockResolvedValue({
                id: '1'
            });
            mockPrisma.company.update.mockResolvedValue({
                id: '1',
                name: 'Updated'
            });
            const result = await service.update('1', {
                name: 'Updated'
            });
            (0, _vitest.expect)(result.name).toBe('Updated');
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete company', async ()=>{
            mockPrisma.company.findUnique.mockResolvedValue({
                id: '1'
            });
            mockPrisma.company.delete.mockResolvedValue({
                id: '1'
            });
            const result = await service.delete('1');
            (0, _vitest.expect)(result.id).toBe('1');
        });
    });
});

//# sourceMappingURL=companies.service.spec.js.map