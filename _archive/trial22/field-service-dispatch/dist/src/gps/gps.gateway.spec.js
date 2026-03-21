"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const gps_gateway_js_1 = require("./gps.gateway.js");
(0, vitest_1.describe)('GpsGateway', () => {
    let gateway;
    (0, vitest_1.beforeEach)(() => {
        gateway = new gps_gateway_js_1.GpsGateway();
        gateway.server = {
            to: vitest_1.vi.fn().mockReturnThis(),
            emit: vitest_1.vi.fn(),
        };
    });
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(gateway).toBeDefined();
    });
    (0, vitest_1.describe)('handleConnection', () => {
        (0, vitest_1.it)('should join company room when companyId provided', () => {
            const client = {
                handshake: { query: { companyId: 'c1' } },
                join: vitest_1.vi.fn(),
            };
            gateway.handleConnection(client);
            (0, vitest_1.expect)(client.join).toHaveBeenCalledWith('company:c1');
        });
        (0, vitest_1.it)('should not join room when companyId is missing', () => {
            const client = {
                handshake: { query: {} },
                join: vitest_1.vi.fn(),
            };
            gateway.handleConnection(client);
            (0, vitest_1.expect)(client.join).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should not join room when companyId is array', () => {
            const client = {
                handshake: { query: { companyId: ['a', 'b'] } },
                join: vitest_1.vi.fn(),
            };
            gateway.handleConnection(client);
            (0, vitest_1.expect)(client.join).not.toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('handleDisconnect', () => {
        (0, vitest_1.it)('should handle disconnect without errors', () => {
            const client = {};
            (0, vitest_1.expect)(() => gateway.handleDisconnect(client)).not.toThrow();
        });
    });
    (0, vitest_1.describe)('handlePositionUpdate', () => {
        (0, vitest_1.it)('should broadcast position to company room', () => {
            const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
            const client = {
                handshake: { query: { companyId: 'c1' } },
            };
            gateway.handlePositionUpdate(data, client);
            (0, vitest_1.expect)(gateway.server.to).toHaveBeenCalledWith('company:c1');
            (0, vitest_1.expect)(gateway.server.emit).toHaveBeenCalledWith('position:updated', vitest_1.expect.objectContaining({
                technicianId: 't1',
                lat: 40.7,
                lng: -74.0,
                timestamp: vitest_1.expect.any(String),
            }));
        });
        (0, vitest_1.it)('should return ack response', () => {
            const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
            const client = {
                handshake: { query: { companyId: 'c1' } },
            };
            const result = gateway.handlePositionUpdate(data, client);
            (0, vitest_1.expect)(result).toEqual({ event: 'position:ack', data: { received: true } });
        });
        (0, vitest_1.it)('should not broadcast when no companyId', () => {
            const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
            const client = {
                handshake: { query: {} },
            };
            gateway.handlePositionUpdate(data, client);
            (0, vitest_1.expect)(gateway.server.to).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should include timestamp in broadcast', () => {
            const data = { technicianId: 't1', lat: 40.7, lng: -74.0 };
            const client = {
                handshake: { query: { companyId: 'c1' } },
            };
            gateway.handlePositionUpdate(data, client);
            (0, vitest_1.expect)(gateway.server.emit).toHaveBeenCalledWith('position:updated', vitest_1.expect.objectContaining({ timestamp: vitest_1.expect.any(String) }));
        });
        (0, vitest_1.it)('should pass through technician coordinates', () => {
            const data = { technicianId: 't2', lat: 41.5, lng: -72.3 };
            const client = {
                handshake: { query: { companyId: 'c2' } },
            };
            gateway.handlePositionUpdate(data, client);
            (0, vitest_1.expect)(gateway.server.emit).toHaveBeenCalledWith('position:updated', vitest_1.expect.objectContaining({ lat: 41.5, lng: -72.3 }));
        });
    });
});
//# sourceMappingURL=gps.gateway.spec.js.map