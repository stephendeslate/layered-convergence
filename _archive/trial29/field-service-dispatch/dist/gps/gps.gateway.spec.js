"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _gpsgateway = require("./gps.gateway");
const _gpsservice = require("./gps.service");
const mockGpsService = {
    updateLocation: _vitest.vi.fn()
};
const mockServer = {
    to: _vitest.vi.fn().mockReturnThis(),
    emit: _vitest.vi.fn()
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
        gateway.server = mockServer;
    });
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(gateway).toBeDefined();
    });
    (0, _vitest.describe)('handleConnection', ()=>{
        (0, _vitest.it)('should join company room when companyId provided', ()=>{
            const mockClient = {
                id: 'socket1',
                handshake: {
                    query: {
                        companyId: 'comp1'
                    }
                },
                join: _vitest.vi.fn()
            };
            gateway.handleConnection(mockClient);
            (0, _vitest.expect)(mockClient.join).toHaveBeenCalledWith('company:comp1');
        });
        (0, _vitest.it)('should not join room when no companyId', ()=>{
            const mockClient = {
                id: 'socket1',
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
        (0, _vitest.it)('should remove client from connected clients', ()=>{
            const mockClient = {
                id: 'socket1',
                handshake: {
                    query: {
                        companyId: 'comp1'
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
            const data = {
                technicianId: 't1',
                companyId: 'comp1',
                lat: 40.7,
                lng: -74.0
            };
            const mockClient = {
                id: 'socket1'
            };
            const result = await gateway.handleLocationUpdate(data, mockClient);
            (0, _vitest.expect)(result).toEqual({
                success: true
            });
            (0, _vitest.expect)(mockGpsService.updateLocation).toHaveBeenCalledWith('comp1', 't1', 40.7, -74.0);
            (0, _vitest.expect)(mockServer.to).toHaveBeenCalledWith('company:comp1');
            (0, _vitest.expect)(mockServer.emit).toHaveBeenCalledWith('location:updated', _vitest.expect.objectContaining({
                technicianId: 't1',
                lat: 40.7,
                lng: -74.0
            }));
        });
        (0, _vitest.it)('should use provided timestamp', async ()=>{
            mockGpsService.updateLocation.mockResolvedValue({
                count: 1
            });
            const ts = 1700000000;
            const data = {
                technicianId: 't1',
                companyId: 'comp1',
                lat: 10,
                lng: 20,
                timestamp: ts
            };
            await gateway.handleLocationUpdate(data, {
                id: 'socket1'
            });
            (0, _vitest.expect)(mockServer.emit).toHaveBeenCalledWith('location:updated', _vitest.expect.objectContaining({
                timestamp: ts
            }));
        });
    });
    (0, _vitest.describe)('handleSubscribe', ()=>{
        (0, _vitest.it)('should join company room', ()=>{
            const mockClient = {
                join: _vitest.vi.fn()
            };
            gateway.handleSubscribe({
                companyId: 'comp1'
            }, mockClient);
            (0, _vitest.expect)(mockClient.join).toHaveBeenCalledWith('company:comp1');
        });
    });
    (0, _vitest.describe)('broadcastLocation', ()=>{
        (0, _vitest.it)('should broadcast location to company room', ()=>{
            gateway.broadcastLocation('comp1', 't1', 40.7, -74.0);
            (0, _vitest.expect)(mockServer.to).toHaveBeenCalledWith('company:comp1');
            (0, _vitest.expect)(mockServer.emit).toHaveBeenCalledWith('location:updated', _vitest.expect.objectContaining({
                technicianId: 't1'
            }));
        });
    });
    (0, _vitest.describe)('getConnectedClientCount', ()=>{
        (0, _vitest.it)('should return 0 initially', ()=>{
            (0, _vitest.expect)(gateway.getConnectedClientCount()).toBe(0);
        });
        (0, _vitest.it)('should track connected clients', ()=>{
            const mockClient = {
                id: 'socket1',
                handshake: {
                    query: {
                        companyId: 'comp1'
                    }
                },
                join: _vitest.vi.fn()
            };
            gateway.handleConnection(mockClient);
            (0, _vitest.expect)(gateway.getConnectedClientCount()).toBe(1);
        });
    });
});

//# sourceMappingURL=gps.gateway.spec.js.map