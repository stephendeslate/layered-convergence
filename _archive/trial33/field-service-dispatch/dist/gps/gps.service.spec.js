"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _gpsservice = require("./gps.service");
(0, _vitest.describe)('GpsService', ()=>{
    let service;
    let prisma;
    (0, _vitest.beforeEach)(()=>{
        prisma = {
            technician: {
                update: _vitest.vi.fn(),
                findUnique: _vitest.vi.fn(),
                findMany: _vitest.vi.fn()
            },
            gpsEvent: {
                create: _vitest.vi.fn()
            }
        };
        service = new _gpsservice.GpsService(prisma);
    });
    (0, _vitest.describe)('updatePosition', ()=>{
        (0, _vitest.it)('should update technician position and create gps event', async ()=>{
            const position = {
                technicianId: 'tech-1',
                lat: 40.0,
                lng: -74.0,
                timestamp: Date.now()
            };
            prisma.technician.update.mockResolvedValue({
                id: 'tech-1',
                companyId: 'c-1',
                currentLat: 40.0,
                currentLng: -74.0
            });
            prisma.gpsEvent.create.mockResolvedValue({
                id: 'gps-1'
            });
            const result = await service.updatePosition(position);
            (0, _vitest.expect)(result.currentLat).toBe(40.0);
            (0, _vitest.expect)(prisma.technician.update).toHaveBeenCalledWith({
                where: {
                    id: 'tech-1'
                },
                data: {
                    currentLat: 40.0,
                    currentLng: -74.0
                }
            });
            (0, _vitest.expect)(prisma.gpsEvent.create).toHaveBeenCalledWith({
                data: {
                    technicianId: 'tech-1',
                    lat: 40.0,
                    lng: -74.0
                }
            });
        });
    });
    (0, _vitest.describe)('getPosition', ()=>{
        (0, _vitest.it)('should return technician position', async ()=>{
            prisma.technician.findUnique.mockResolvedValue({
                id: 'tech-1',
                name: 'Tech',
                currentLat: 40.0,
                currentLng: -74.0,
                companyId: 'c-1'
            });
            const result = await service.getPosition('tech-1');
            (0, _vitest.expect)(result.currentLat).toBe(40.0);
            (0, _vitest.expect)(result.currentLng).toBe(-74.0);
        });
        (0, _vitest.it)('should return null for non-existent technician', async ()=>{
            prisma.technician.findUnique.mockResolvedValue(null);
            const result = await service.getPosition('nope');
            (0, _vitest.expect)(result).toBeNull();
        });
    });
    (0, _vitest.describe)('getCompanyPositions', ()=>{
        (0, _vitest.it)('should return positions for non-off-duty technicians', async ()=>{
            prisma.technician.findMany.mockResolvedValue([
                {
                    id: 'tech-1',
                    name: 'Tech 1',
                    currentLat: 40.0,
                    currentLng: -74.0,
                    status: 'AVAILABLE'
                }
            ]);
            const result = await service.getCompanyPositions('c-1');
            (0, _vitest.expect)(result).toHaveLength(1);
            (0, _vitest.expect)(prisma.technician.findMany).toHaveBeenCalledWith({
                where: {
                    companyId: 'c-1',
                    status: {
                        not: 'OFF_DUTY'
                    }
                },
                select: {
                    id: true,
                    name: true,
                    currentLat: true,
                    currentLng: true,
                    status: true
                }
            });
        });
    });
});

//# sourceMappingURL=gps.service.spec.js.map