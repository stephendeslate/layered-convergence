"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GpsController", {
    enumerable: true,
    get: function() {
        return GpsController;
    }
});
const _common = require("@nestjs/common");
const _companycontextguard = require("../common/guards/company-context.guard");
const _companyiddecorator = require("../common/decorators/company-id.decorator");
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
let GpsController = class GpsController {
    getCompanyPositions(companyId) {
        return this.gpsService.getCompanyPositions(companyId);
    }
    getPosition(technicianId) {
        return this.gpsService.getPosition(technicianId);
    }
    constructor(gpsService){
        this.gpsService = gpsService;
    }
};
_ts_decorate([
    (0, _common.Get)('positions'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], GpsController.prototype, "getCompanyPositions", null);
_ts_decorate([
    (0, _common.Get)('positions/:technicianId'),
    _ts_param(0, (0, _common.Param)('technicianId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], GpsController.prototype, "getPosition", null);
GpsController = _ts_decorate([
    (0, _common.Controller)('gps'),
    (0, _common.UseGuards)(_companycontextguard.CompanyContextGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _gpsservice.GpsService === "undefined" ? Object : _gpsservice.GpsService
    ])
], GpsController);

//# sourceMappingURL=gps.controller.js.map