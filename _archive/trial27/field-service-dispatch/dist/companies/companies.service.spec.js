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
        _vitest.vi.clearAllMocks();
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
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(service).toBeDefined();
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a company', async ()=>{
            mockPrisma.company.create.mockResolvedValue({
                id: '1',
                name: 'Test',
                slug: 'test'
            });
            const result = await service.create({
                name: 'Test',
                slug: 'test'
            });
            (0, _vitest.expect)(result.name).toBe('Test');
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
        (0, _vitest.it)('should return a company', async ()=>{
            mockPrisma.company.findUnique.mockResolvedValue({
                id: '1',
                name: 'Test'
            });
            const result = await service.findOne('1');
            (0, _vitest.expect)(result.name).toBe('Test');
        });
        (0, _vitest.it)('should throw NotFoundException', async ()=>{
            mockPrisma.company.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('bad')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('findBySlug', ()=>{
        (0, _vitest.it)('should return company by slug', async ()=>{
            mockPrisma.company.findUnique.mockResolvedValue({
                id: '1',
                slug: 'test'
            });
            const result = await service.findBySlug('test');
            (0, _vitest.expect)(result.slug).toBe('test');
        });
        (0, _vitest.it)('should throw NotFoundException for unknown slug', async ()=>{
            mockPrisma.company.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findBySlug('nope')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update a company', async ()=>{
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
        (0, _vitest.it)('should delete a company', async ()=>{
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