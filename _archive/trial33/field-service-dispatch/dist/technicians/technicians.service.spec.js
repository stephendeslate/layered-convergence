"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _techniciansservice = require("./technicians.service");
const _common = require("@nestjs/common");
(0, _vitest.describe)('TechniciansService', ()=>{
    let service;
    let prisma;
    const companyId = 'company-1';
    (0, _vitest.beforeEach)(()=>{
        prisma = {
            technician: {
                create: _vitest.vi.fn(),
                findMany: _vitest.vi.fn(),
                findFirst: _vitest.vi.fn(),
                update: _vitest.vi.fn(),
                delete: _vitest.vi.fn()
            }
        };
        service = new _techniciansservice.TechniciansService(prisma);
    });
    (0, _vitest.describe)('create', ()=>{
        (0, _vitest.it)('should create a technician with companyId', async ()=>{
            const dto = {
                name: 'Tech 1',
                email: 'tech@example.com'
            };
            prisma.technician.create.mockResolvedValue({
                id: 'tech-1',
                companyId,
                ...dto
            });
            const result = await service.create(companyId, dto);
            (0, _vitest.expect)(result.companyId).toBe(companyId);
        });
        (0, _vitest.it)('should default skills to empty array', async ()=>{
            const dto = {
                name: 'Tech 1',
                email: 'tech@example.com'
            };
            prisma.technician.create.mockResolvedValue({
                id: 'tech-1'
            });
            await service.create(companyId, dto);
            (0, _vitest.expect)(prisma.technician.create).toHaveBeenCalledWith({
                data: _vitest.expect.objectContaining({
                    skills: []
                })
            });
        });
    });
    (0, _vitest.describe)('findAll', ()=>{
        (0, _vitest.it)('should return technicians filtered by companyId', async ()=>{
            prisma.technician.findMany.mockResolvedValue([
                {
                    id: 'tech-1'
                }
            ]);
            const result = await service.findAll(companyId);
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('findOne', ()=>{
        (0, _vitest.it)('should return a technician by id and companyId', async ()=>{
            prisma.technician.findFirst.mockResolvedValue({
                id: 'tech-1'
            });
            const result = await service.findOne(companyId, 'tech-1');
            (0, _vitest.expect)(result.id).toBe('tech-1');
        });
        (0, _vitest.it)('should throw NotFoundException if not found', async ()=>{
            prisma.technician.findFirst.mockResolvedValue(null);
            await (0, _vitest.expect)(service.findOne(companyId, 'nope')).rejects.toThrow(_common.NotFoundException);
        });
    });
    (0, _vitest.describe)('update', ()=>{
        (0, _vitest.it)('should update a technician', async ()=>{
            prisma.technician.findFirst.mockResolvedValue({
                id: 'tech-1'
            });
            prisma.technician.update.mockResolvedValue({
                id: 'tech-1',
                name: 'Updated'
            });
            const result = await service.update(companyId, 'tech-1', {
                name: 'Updated'
            });
            (0, _vitest.expect)(result.name).toBe('Updated');
        });
    });
    (0, _vitest.describe)('delete', ()=>{
        (0, _vitest.it)('should delete a technician', async ()=>{
            prisma.technician.findFirst.mockResolvedValue({
                id: 'tech-1'
            });
            prisma.technician.delete.mockResolvedValue({
                id: 'tech-1'
            });
            const result = await service.delete(companyId, 'tech-1');
            (0, _vitest.expect)(result.id).toBe('tech-1');
        });
    });
    (0, _vitest.describe)('findAvailable', ()=>{
        (0, _vitest.it)('should return available technicians', async ()=>{
            prisma.technician.findMany.mockResolvedValue([
                {
                    id: 'tech-1',
                    status: 'AVAILABLE'
                }
            ]);
            const result = await service.findAvailable(companyId);
            (0, _vitest.expect)(result).toHaveLength(1);
            (0, _vitest.expect)(prisma.technician.findMany).toHaveBeenCalledWith({
                where: {
                    companyId,
                    status: 'AVAILABLE'
                }
            });
        });
    });
    (0, _vitest.describe)('findNearest', ()=>{
        (0, _vitest.it)('should return nearest available technician', async ()=>{
            prisma.technician.findMany.mockResolvedValue([
                {
                    id: 'tech-1',
                    currentLat: 40.0,
                    currentLng: -74.0,
                    status: 'AVAILABLE'
                },
                {
                    id: 'tech-2',
                    currentLat: 40.1,
                    currentLng: -74.1,
                    status: 'AVAILABLE'
                }
            ]);
            const result = await service.findNearest(companyId, 40.0, -74.0);
            (0, _vitest.expect)(result.id).toBe('tech-1');
        });
        (0, _vitest.it)('should return null when no available technicians', async ()=>{
            prisma.technician.findMany.mockResolvedValue([]);
            const result = await service.findNearest(companyId, 40.0, -74.0);
            (0, _vitest.expect)(result).toBeNull();
        });
        (0, _vitest.it)('should skip technicians without coordinates', async ()=>{
            prisma.technician.findMany.mockResolvedValue([
                {
                    id: 'tech-1',
                    currentLat: null,
                    currentLng: null,
                    status: 'AVAILABLE'
                },
                {
                    id: 'tech-2',
                    currentLat: 40.05,
                    currentLng: -74.05,
                    status: 'AVAILABLE'
                }
            ]);
            const result = await service.findNearest(companyId, 40.0, -74.0);
            (0, _vitest.expect)(result.id).toBe('tech-2');
        });
    });
});

//# sourceMappingURL=technicians.service.spec.js.map