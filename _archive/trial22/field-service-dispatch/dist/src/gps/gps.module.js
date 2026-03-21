"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GpsModule = void 0;
const common_1 = require("@nestjs/common");
const gps_gateway_js_1 = require("./gps.gateway.js");
let GpsModule = class GpsModule {
};
exports.GpsModule = GpsModule;
exports.GpsModule = GpsModule = __decorate([
    (0, common_1.Module)({
        providers: [gps_gateway_js_1.GpsGateway],
        exports: [gps_gateway_js_1.GpsGateway],
    })
], GpsModule);
//# sourceMappingURL=gps.module.js.map