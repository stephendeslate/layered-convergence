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
        updateMany: _vitest.vi.fn(),
        findMany: _vitest.vi.fn(),
        findFirst: _vitest.vi.fn()
    }
};
(0, _vitest.describe)('GpsService', ()=>{
    let service;
    (0, _vitest.beforeEach)(async ()=>{
        _vitest.vi.clearAllMocks();
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
    });
    (0, _vitest.describe)('updateLocation', ()=>{
        (0, _vitest.it)('should update technician location', async ()=>{
            mockPrisma.technician.updateMany.mockResolvedValue({
                count: 1
            });
            const result = await service.updateLocation('comp1', 't1', 40.7, -74.0);
            (0, _vitest.expect)(result.count).toBe(1);
            (0, _vitest.expect)(mockPrisma.technician.updateMany).toHaveBeenCalledWith({
                where: {
                    id: 't1',
                    companyId: 'comp1'
                },
                data: {
                    currentLat: 40.7,
                    currentLng: -74.0
                }
            });
        });
    });
    (0, _vitest.describe)('getLocations', ()=>{
        (0, _vitest.it)('should return technicians with coordinates', async ()=>{
            mockPrisma.technician.findMany.mockResolvedValue([
                {
                    id: 't1',
                    name: 'John',
                    currentLat: 40.7,
                    currentLng: -74.0,
                    status: 'AVAILABLE'
                }
            ]);
            const result = await service.getLocations('comp1');
            (0, _vitest.expect)(result).toHaveLength(1);
            (0, _vitest.expect)(result[0].currentLat).toBe(40.7);
        });
    });
    (0, _vitest.describe)('getTechnicianLocation', ()=>{
        (0, _vitest.it)('should return single technician location', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue({
                id: 't1',
                currentLat: 40.7,
                currentLng: -74.0
            });
            const result = await service.getTechnicianLocation('comp1', 't1');
            (0, _vitest.expect)(result?.id).toBe('t1');
        });
        (0, _vitest.it)('should return null when technician not found', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue(null);
            const result = await service.getTechnicianLocation('comp1', 't999');
            (0, _vitest.expect)(result).toBeNull();
        });
    });
    (0, _vitest.describe)('calculateDistance', ()=>{
        (0, _vitest.it)('should return 0 for same coordinates', ()=>{
            const dist = service.calculateDistance(40.7, -74.0, 40.7, -74.0);
            (0, _vitest.expect)(dist).toBe(0);
        });
        (0, _vitest.it)('should calculate distance between two points', ()=>{
            const dist = service.calculateDistance(40.7128, -74.006, 34.0522, -118.2437);
            (0, _vitest.expect)(dist).toBeGreaterThan(3900);
            (0, _vitest.expect)(dist).toBeLessThan(4000);
        });
        (0, _vitest.it)('should return same distance regardless of direction', ()=>{
            const d1 = service.calculateDistance(0, 0, 10, 10);
            const d2 = service.calculateDistance(10, 10, 0, 0);
            (0, _vitest.expect)(d1).toBeCloseTo(d2, 5);
        });
    });
});

//# sourceMappingURL=gps.service.spec.js.map