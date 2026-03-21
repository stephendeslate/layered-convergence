"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _companiesservice = require("./companies.service");
const _common = require("@nestjs/common");
(0, _vitest.describe)('CompaniesService', ()=>{
    let service;
    let prisma;
    (0, _vitest.beforeEach)(()=>{
        prisma = {
            company: {
                create: _vitest.vi.fn(),
                findMany: _vitest.vi.fn(),
                findUnique: _vitest.vi.fn(),
                update: _vitest.vi.fn(),
                delete: _vitest.vi.fn()
            }
        };
        service = new _companiesservice.CompaniesService(prisma);
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a company', async ()=>{
            const dto = {
                name: 'Test Co',
                slug: 'test-co'
            };
            const expected = {
                id: 'c-1',
                ...dto
            };
            prisma.company.create.mockResolvedValue(expected);
            const result = await service.create(dto);
            (0, _vitest.expect)(result).toEqual(expected);
            (0, _vitest.expect)(prisma.company.create).toHaveBeenCalledWith({
                data: _vitest.expect.objectContaining({
                    name: 'Test Co',
                    slug: 'test-co'
                })
            });
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return all companies', async ()=>{
            const companies = [
                {
                    id: 'c-1'
                },
                {
                    id: 'c-2'
                }
            ];
            prisma.company.findMany.mockResolvedValue(companies);
            const result = await service.findAll();
            (0, _vitest.expect)(result).toEqual(companies);
            (0, _vitest.expect)(prisma.company.findMany).toHaveBeenCalledWith({
                orderBy: {
                    createdAt: 'desc'
                }
            });
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return a company by id', async ()=>{
            const company = {
                id: 'c-1',
                name: 'Test'
            };
            prisma.company.findUnique.mockResolvedValue(company);
            const result = await service.findOne('c-1');
            (0, _vitest.expect)(result).toEqual(company);
        });
        (0, _vitest.it)('should throw NotFoundException if not found', async ()=>{
            prisma.company.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne('nonexistent')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('findBySlug', ()=>{
        (0, _vitest.it)('should return a company by slug', async ()=>{
            const company = {
                id: 'c-1',
                slug: 'test-co'
            };
            prisma.company.findUnique.mockResolvedValue(company);
            const result = await service.findBySlug('test-co');
            (0, _vitest.expect)(result).toEqual(company);
        });
        (0, _vitest.it)('should throw NotFoundException if slug not found', async ()=>{
            prisma.company.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findBySlug('nope')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update a company', async ()=>{
            prisma.company.findUnique.mockResolvedValue({
                id: 'c-1'
            });
            prisma.company.update.mockResolvedValue({
                id: 'c-1',
                name: 'Updated'
            });
            const result = await service.update('c-1', {
                name: 'Updated'
            });
            (0, _vitest.expect)(result.name).toBe('Updated');
        });
        (0, _vitest.it)('should throw NotFoundException if company does not exist', async ()=>{
            prisma.company.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.update('nope', {
                name: 'Updated'
            })).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete a company', async ()=>{
            prisma.company.findUnique.mockResolvedValue({
                id: 'c-1'
            });
            prisma.company.delete.mockResolvedValue({
                id: 'c-1'
            });
            const result = await service.delete('c-1');
            (0, _vitest.expect)(result.id).toBe('c-1');
        });
        (0, _vitest.it)('should throw NotFoundException if company does not exist', async ()=>{
            prisma.company.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.delete('nope')).rejects.toThrow(_common.NotFoundException);
        });
    });
});

//# sourceMappingURL=companies.service.spec.js.map