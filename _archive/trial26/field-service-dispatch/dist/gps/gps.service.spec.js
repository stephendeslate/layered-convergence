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
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(service).toBeDefined();
    });
    (0, _vitest.describe)('updateLocation', ()=>{
        (0, _vitest.it)('should update technician location', async ()=>{
            mockPrisma.technician.updateMany.mockResolvedValue({
                count: 1
            });
            const result = await service.updateLocation('comp-1', 'tech-1', 40.7, -74.0);
            (0, _vitest.expect)(result.count).toBe(1);
            (0, _vitest.expect)(mockPrisma.technician.updateMany).toHaveBeenCalledWith({
                where: {
                    id: 'tech-1',
                    companyId: 'comp-1'
                },
                data: {
                    currentLat: 40.7,
                    currentLng: -74.0
                }
            });
        });
    });
    (0, _vitest.describe)('getLocations', ()=>{
        (0, _vitest.it)('should return all technicians with locations', async ()=>{
            mockPrisma.technician.findMany.mockResolvedValue([
                {
                    id: '1',
                    name: 'Tech',
                    currentLat: 40.0,
                    currentLng: -74.0,
                    status: 'AVAILABLE'
                }
            ]);
            const result = await service.getLocations('comp-1');
            (0, _vitest.expect)(result).toHaveLength(1);
        });
    });
    (0, _vitest.describe)('getTechnicianLocation', ()=>{
        (0, _vitest.it)('should return a technician location', async ()=>{
            mockPrisma.technician.findFirst.mockResolvedValue({
                id: '1',
                currentLat: 40.0,
                currentLng: -74.0
            });
            const result = await service.getTechnicianLocation('comp-1', '1');
            (0, _vitest.expect)(result?.currentLat).toBe(40.0);
        });
    });
    (0, _vitest.describe)('calculateDistance', ()=>{
        (0, _vitest.it)('should calculate distance between two points', ()=>{
            const dist = service.calculateDistance(40.7128, -74.006, 40.7228, -74.016);
            (0, _vitest.expect)(dist).toBeGreaterThan(0);
            (0, _vitest.expect)(dist).toBeLessThan(5);
        });
        (0, _vitest.it)('should return 0 for same point', ()=>{
            const dist = service.calculateDistance(40.0, -74.0, 40.0, -74.0);
            (0, _vitest.expect)(dist).toBe(0);
        });
        (0, _vitest.it)('should handle large distances', ()=>{
            const dist = service.calculateDistance(0, 0, 90, 0);
            (0, _vitest.expect)(dist).toBeGreaterThan(9000);
        });
    });
});

//# sourceMappingURL=gps.service.spec.js.map