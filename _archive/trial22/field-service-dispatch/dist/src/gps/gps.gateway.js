"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GpsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let GpsGateway = class GpsGateway {
    server;
    handleConnection(client) {
        const companyId = client.handshake.query['companyId'];
        if (companyId && typeof companyId === 'string') {
            client.join(`company:${companyId}`);
        }
    }
    handleDisconnect(_client) {
    }
    handlePositionUpdate(data, client) {
        const companyId = client.handshake.query['companyId'];
        if (companyId && typeof companyId === 'string') {
            this.server.to(`company:${companyId}`).emit('position:updated', {
                technicianId: data.technicianId,
                lat: data.lat,
                lng: data.lng,
                timestamp: new Date().toISOString(),
            });
        }
        return { event: 'position:ack', data: { received: true } };
    }
};
exports.GpsGateway = GpsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GpsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('position:update'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GpsGateway.prototype, "handlePositionUpdate", null);
exports.GpsGateway = GpsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true })
], GpsGateway);
//# sourceMappingURL=gps.gateway.js.map