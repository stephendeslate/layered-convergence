"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _gpsgateway = require("./gps.gateway");
const _gpsservice = require("./gps.service");
const mockGpsService = {
    updatePosition: _vitest.vi.fn(),
    getPosition: _vitest.vi.fn(),
    getCompanyPositions: _vitest.vi.fn()
};
(0, _vitest.describe)('GpsGateway', ()=>{
    let gateway;
    (0, _vitest.beforeEach)(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _gpsgateway.GpsGateway,
                {
                    provide: _gpsservice.GpsService,
                    useValue: mockGpsService
                }
            ]
        }).compile();
        gateway = module.get(_gpsgateway.GpsGateway);
        gateway.server = {
            to: _vitest.vi.fn().mockReturnThis(),
            emit: _vitest.vi.fn()
        };
        _vitest.vi.clearAllMocks();
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(gateway).toBeDefined();
    });
    (0, _vitest.describe)('handleConnection', ()=>{
        (0, _vitest.it)('should join company room when companyId provided', ()=>{
            const client = {
                handshake: {
                    query: {
                        companyId: 'comp-1'
                    }
                },
                join: _vitest.vi.fn()
            };
            gateway.handleConnection(client);
            (0, _vitest.expect)(client.join).toHaveBeenCalledWith('company:comp-1');
        });
        (0, _vitest.it)('should not join room when no companyId', ()=>{
            const client = {
                handshake: {
                    query: {}
                },
                join: _vitest.vi.fn()
            };
            gateway.handleConnection(client);
            (0, _vitest.expect)(client.join).not.toHaveBeenCalled();
        });
    });
    (0, _vitest.describe)('handleDisconnect', ()=>{
        (0, _vitest.it)('should handle disconnect without error', ()=>{
            (0, _vitest.expect)(()=>gateway.handleDisconnect({})).not.toThrow();
        });
    });
    (0, _vitest.describe)('handlePositionUpdate', ()=>{
        (0, _vitest.it)('should update position and broadcast', async ()=>{
            const data = {
                technicianId: 'tech-1',
                lat: 40.0,
                lng: -74.0,
                timestamp: Date.now()
            };
            mockGpsService.updatePosition.mockResolvedValue({
                id: 'tech-1',
                name: 'Alice',
                companyId: 'comp-1',
                currentLat: 40.0,
                currentLng: -74.0
            });
            const result = await gateway.handlePositionUpdate(data, {});
            (0, _vitest.expect)(result).toEqual({
                event: 'position:ack',
                data: {
                    success: true
                }
            });
            (0, _vitest.expect)(gateway.server.to).toHaveBeenCalledWith('company:comp-1');
        });
    });
    (0, _vitest.describe)('handleJoinCompany', ()=>{
        (0, _vitest.it)('should join company room', ()=>{
            const client = {
                join: _vitest.vi.fn()
            };
            const result = gateway.handleJoinCompany({
                companyId: 'comp-1'
            }, client);
            (0, _vitest.expect)(client.join).toHaveBeenCalledWith('company:comp-1');
            (0, _vitest.expect)(result).toEqual({
                event: 'company:joined',
                data: {
                    companyId: 'comp-1'
                }
            });
        });
    });
});

//# sourceMappingURL=gps.gateway.spec.js.map