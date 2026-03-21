"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GpsGateway", {
    enumerable: true,
    get: function() {
        return GpsGateway;
    }
});
const _websockets = require("@nestjs/websockets");
const _socketio = require("socket.io");
const _gpsservice = require("./gps.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let GpsGateway = class GpsGateway {
    handleConnection(client) {
        const companyId = client.handshake.query['companyId'];
        if (companyId) {
            client.join(`company:${companyId}`);
        }
    }
    handleDisconnect(_client) {
    // cleanup handled by socket.io
    }
    async handlePositionUpdate(data, client) {
        const updated = await this.gpsService.updatePosition(data);
        const companyId = updated.companyId;
        this.server.to(`company:${companyId}`).emit('position:updated', {
            technicianId: updated.id,
            name: updated.name,
            lat: updated.currentLat,
            lng: updated.currentLng,
            timestamp: Date.now()
        });
        return {
            event: 'position:ack',
            data: {
                success: true
            }
        };
    }
    handleJoinCompany(data, client) {
        client.join(`company:${data.companyId}`);
        return {
            event: 'company:joined',
            data: {
                companyId: data.companyId
            }
        };
    }
    constructor(gpsService){
        this.gpsService = gpsService;
    }
};
_ts_decorate([
    (0, _websockets.WebSocketServer)(),
    _ts_metadata("design:type", typeof _socketio.Server === "undefined" ? Object : _socketio.Server)
], GpsGateway.prototype, "server", void 0);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('position:update'),
    _ts_param(0, (0, _websockets.MessageBody)()),
    _ts_param(1, (0, _websockets.ConnectedSocket)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _gpsservice.GpsPosition === "undefined" ? Object : _gpsservice.GpsPosition,
        typeof _socketio.Socket === "undefined" ? Object : _socketio.Socket
    ]),
    _ts_metadata("design:returntype", Promise)
], GpsGateway.prototype, "handlePositionUpdate", null);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('company:join'),
    _ts_param(0, (0, _websockets.MessageBody)()),
    _ts_param(1, (0, _websockets.ConnectedSocket)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _socketio.Socket === "undefined" ? Object : _socketio.Socket
    ]),
    _ts_metadata("design:returntype", void 0)
], GpsGateway.prototype, "handleJoinCompany", null);
GpsGateway = _ts_decorate([
    (0, _websockets.WebSocketGateway)({
        cors: {
            origin: '*'
        },
        namespace: '/gps'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _gpsservice.GpsService === "undefined" ? Object : _gpsservice.GpsService
    ])
], GpsGateway);

//# sourceMappingURL=gps.gateway.js.map