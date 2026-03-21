"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _gpsgateway = require("./gps.gateway");
const _gpsservice = require("./gps.service");
const mockGpsService = {
    updateLocation: _vitest.vi.fn(),
    getLocations: _vitest.vi.fn(),
    getTechnicianLocation: _vitest.vi.fn()
};
(0, _vitest.describe)('GpsGateway', ()=>{
    let gateway;
    (0, _vitest.beforeEach)(async ()=>{
        _vitest.vi.clearAllMocks();
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
            to: _vitest.vi.fn().mockReturnValue({
                emit: _vitest.vi.fn()
            })
        };
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(gateway).toBeDefined();
    });
    (0, _vitest.describe)('handleConnection', ()=>{
        (0, _vitest.it)('should join company room when companyId provided', ()=>{
            const mockClient = {
                id: 'client-1',
                handshake: {
                    query: {
                        companyId: 'comp-1'
                    }
                },
                join: _vitest.vi.fn()
            };
            gateway.handleConnection(mockClient);
            (0, _vitest.expect)(mockClient.join).toHaveBeenCalledWith('company:comp-1');
        });
        (0, _vitest.it)('should not join room when companyId not provided', ()=>{
            const mockClient = {
                id: 'client-2',
                handshake: {
                    query: {}
                },
                join: _vitest.vi.fn()
            };
            gateway.handleConnection(mockClient);
            (0, _vitest.expect)(mockClient.join).not.toHaveBeenCalled();
        });
    });
    (0, _vitest.describe)('handleDisconnect', ()=>{
        (0, _vitest.it)('should remove client from connected map', ()=>{
            const mockClient = {
                id: 'client-1',
                handshake: {
                    query: {
                        companyId: 'comp-1'
                    }
                },
                join: _vitest.vi.fn()
            };
            gateway.handleConnection(mockClient);
            (0, _vitest.expect)(gateway.getConnectedClientCount()).toBe(1);
            gateway.handleDisconnect(mockClient);
            (0, _vitest.expect)(gateway.getConnectedClientCount()).toBe(0);
        });
    });
    (0, _vitest.describe)('handleLocationUpdate', ()=>{
        (0, _vitest.it)('should update location and broadcast', async ()=>{
            mockGpsService.updateLocation.mockResolvedValue({
                count: 1
            });
            const mockClient = {
                id: 'client-1'
            };
            const data = {
                technicianId: 'tech-1',
                companyId: 'comp-1',
                lat: 40.7,
                lng: -74.0,
                timestamp: 1234567890
            };
            const result = await gateway.handleLocationUpdate(data, mockClient);
            (0, _vitest.expect)(result).toEqual({
                success: true
            });
            (0, _vitest.expect)(mockGpsService.updateLocation).toHaveBeenCalledWith('comp-1', 'tech-1', 40.7, -74.0);
            (0, _vitest.expect)(gateway.server.to).toHaveBeenCalledWith('company:comp-1');
        });
    });
    (0, _vitest.describe)('handleSubscribe', ()=>{
        (0, _vitest.it)('should join company room', ()=>{
            const mockClient = {
                join: _vitest.vi.fn()
            };
            gateway.handleSubscribe({
                companyId: 'comp-1'
            }, mockClient);
            (0, _vitest.expect)(mockClient.join).toHaveBeenCalledWith('company:comp-1');
        });
    });
    (0, _vitest.describe)('broadcastLocation', ()=>{
        (0, _vitest.it)('should broadcast to company room', ()=>{
            gateway.broadcastLocation('comp-1', 'tech-1', 40.7, -74.0);
            (0, _vitest.expect)(gateway.server.to).toHaveBeenCalledWith('company:comp-1');
        });
    });
    (0, _vitest.describe)('getConnectedClientCount', ()=>{
        (0, _vitest.it)('should return 0 initially', ()=>{
            (0, _vitest.expect)(gateway.getConnectedClientCount()).toBe(0);
        });
    });
});

//# sourceMappingURL=gps.gateway.spec.js.map