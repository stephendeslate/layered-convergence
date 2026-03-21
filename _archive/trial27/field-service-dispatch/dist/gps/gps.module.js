"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GpsModule", {
    enumerable: true,
    get: function() {
        return GpsModule;
    }
});
const _common = require("@nestjs/common");
const _gpsgateway = require("./gps.gateway");
const _gpsservice = require("./gps.service");
const _gpscontroller = require("./gps.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let GpsModule = class GpsModule {
};
GpsModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _gpscontroller.GpsController
        ],
        providers: [
            _gpsgateway.GpsGateway,
            _gpsservice.GpsService
        ],
        exports: [
            _gpsservice.GpsService,
            _gpsgateway.GpsGateway
        ]
    })
], GpsModule);

//# sourceMappingURL=gps.module.js.map