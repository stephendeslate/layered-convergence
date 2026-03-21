"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _gpsgateway = require("./gps.gateway");
(0, _vitest.describe)('GpsGateway', ()=>{
    let gateway;
    let gpsService;
    let mockServer;
    (0, _vitest.beforeEach)(()=>{
        gpsService = {
            updatePosition: _vitest.vi.fn()
        };
        gateway = new _gpsgateway.GpsGateway(gpsService);
        mockServer = {
            to: _vitest.vi.fn().mockReturnThis(),
            emit: _vitest.vi.fn()
        };
        gateway.server = mockServer;
    });
    (0, _vitest.describe)('handleConnection', ()=>{
        (0, _vitest.it)('should join company room when companyId provided', ()=>{
            const client = {
                handshake: {
                    query: {
                        companyId: 'c-1'
                    }
                },
                join: _vitest.vi.fn()
            };
            gateway.handleConnection(client);
            (0, _vitest.expect)(client.join).toHaveBeenCalledWith('company:c-1');
        });
        (0, _vitest.it)('should not join room when companyId not provided', ()=>{
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
            const client = {};
            (0, _vitest.expect)(()=>gateway.handleDisconnect(client)).not.toThrow();
        });
    });
    (0, _vitest.describe)('handlePositionUpdate', ()=>{
        (0, _vitest.it)('should update position and broadcast to company room', async ()=>{
            const data = {
                technicianId: 'tech-1',
                lat: 40.0,
                lng: -74.0,
                timestamp: 12345
            };
            const client = {};
            gpsService.updatePosition.mockResolvedValue({
                id: 'tech-1',
                name: 'Tech 1',
                companyId: 'c-1',
                currentLat: 40.0,
                currentLng: -74.0
            });
            const result = await gateway.handlePositionUpdate(data, client);
            (0, _vitest.expect)(gpsService.updatePosition).toHaveBeenCalledWith(data);
            (0, _vitest.expect)(mockServer.to).toHaveBeenCalledWith('company:c-1');
            (0, _vitest.expect)(mockServer.emit).toHaveBeenCalledWith('position:updated', _vitest.expect.objectContaining({
                technicianId: 'tech-1',
                name: 'Tech 1',
                lat: 40.0,
                lng: -74.0
            }));
            (0, _vitest.expect)(result).toEqual({
                event: 'position:ack',
                data: {
                    success: true
                }
            });
        });
    });
    (0, _vitest.describe)('handleJoinCompany', ()=>{
        (0, _vitest.it)('should join client to company room', ()=>{
            const client = {
                join: _vitest.vi.fn()
            };
            const result = gateway.handleJoinCompany({
                companyId: 'c-2'
            }, client);
            (0, _vitest.expect)(client.join).toHaveBeenCalledWith('company:c-2');
            (0, _vitest.expect)(result).toEqual({
                event: 'company:joined',
                data: {
                    companyId: 'c-2'
                }
            });
        });
    });
});

//# sourceMappingURL=gps.gateway.spec.js.map