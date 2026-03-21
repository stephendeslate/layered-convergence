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
        const companyId = client.handshake.query.companyId;
        if (companyId) {
            client.join(`company:${companyId}`);
            this.connectedClients.set(client.id, companyId);
        }
    }
    handleDisconnect(client) {
        this.connectedClients.delete(client.id);
    }
    async handleLocationUpdate(data, client) {
        await this.gpsService.updateLocation(data.companyId, data.technicianId, data.lat, data.lng);
        this.server.to(`company:${data.companyId}`).emit('location:updated', {
            technicianId: data.technicianId,
            lat: data.lat,
            lng: data.lng,
            timestamp: data.timestamp || Date.now()
        });
        return {
            success: true
        };
    }
    handleSubscribe(data, client) {
        client.join(`company:${data.companyId}`);
    }
    broadcastLocation(companyId, technicianId, lat, lng) {
        this.server.to(`company:${companyId}`).emit('location:updated', {
            technicianId,
            lat,
            lng,
            timestamp: Date.now()
        });
    }
    getConnectedClientCount() {
        return this.connectedClients.size;
    }
    constructor(gpsService){
        this.gpsService = gpsService;
        this.connectedClients = new Map();
    }
};
_ts_decorate([
    (0, _websockets.WebSocketServer)(),
    _ts_metadata("design:type", typeof _socketio.Server === "undefined" ? Object : _socketio.Server)
], GpsGateway.prototype, "server", void 0);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('location:update'),
    _ts_param(0, (0, _websockets.MessageBody)()),
    _ts_param(1, (0, _websockets.ConnectedSocket)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof LocationUpdate === "undefined" ? Object : LocationUpdate,
        typeof _socketio.Socket === "undefined" ? Object : _socketio.Socket
    ]),
    _ts_metadata("design:returntype", Promise)
], GpsGateway.prototype, "handleLocationUpdate", null);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('location:subscribe'),
    _ts_param(0, (0, _websockets.MessageBody)()),
    _ts_param(1, (0, _websockets.ConnectedSocket)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _socketio.Socket === "undefined" ? Object : _socketio.Socket
    ]),
    _ts_metadata("design:returntype", void 0)
], GpsGateway.prototype, "handleSubscribe", null);
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