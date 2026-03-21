"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _gpsservice = require("./gps.service");
const _prismaservice = require("../prisma/prisma.service");
const mockPrisma = {
    technician: {
        update: _vitest.vi.fn(),
        findUnique: _vitest.vi.fn(),
        findMany: _vitest.vi.fn()
    }
};
(0, _vitest.describe)('GpsService', ()=>{
    let service;
    (0, _vitest.beforeEach)(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _gpsservice.GpsService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_gpsservice.GpsService);
        _vitest.vi.clearAllMocks();
    });
    (0, _vitest.describe)('updatePosition', ()=>{
        (0, _vitest.it)('should update technician position', async ()=>{
            mockPrisma.technician.update.mockResolvedValue({
                id: 'tech-1',
                currentLat: 40.0,
                currentLng: -74.0
            });
            const result = await service.updatePosition({
                technicianId: 'tech-1',
                lat: 40.0,
                lng: -74.0,
                timestamp: Date.now()
            });
            (0, _vitest.expect)(result.currentLat).toBe(40.0);
            (0, _vitest.expect)(mockPrisma.technician.update).toHaveBeenCalledWith({
                where: {
                    id: 'tech-1'
                },
                data: {
                    currentLat: 40.0,
                    currentLng: -74.0
                }
            });
        });
    });
    (0, _vitest.describe)('getPosition', ()=>{
        (0, _vitest.it)('should return technician position', async ()=>{
            mockPrisma.technician.findUnique.mockResolvedValue({
                id: 'tech-1',
                name: 'Alice',
                currentLat: 40.0,
                currentLng: -74.0,
                companyId: 'comp-1'
            });
            const result = await service.getPosition('tech-1');
            (0, _vitest.expect)(result?.currentLat).toBe(40.0);
        });
    });
    (0, _vitest.describe)('getCompanyPositions', ()=>{
        (0, _vitest.it)('should return positions for active technicians', async ()=>{
            mockPrisma.technician.findMany.mockResolvedValue([
                {
                    id: 'tech-1',
                    currentLat: 40.0,
                    currentLng: -74.0,
                    status: 'AVAILABLE'
                }
            ]);
            const result = await service.getCompanyPositions('comp-1');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
});

//# sourceMappingURL=gps.service.spec.js.map