"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RoutesController", {
    enumerable: true,
    get: function() {
        return RoutesController;
    }
});
const _common = require("@nestjs/common");
const _companycontextguard = require("../common/guards/company-context.guard");
const _companyiddecorator = require("../common/decorators/company-id.decorator");
const _routesservice = require("./routes.service");
const _createroutedto = require("./dto/create-route.dto");
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
let RoutesController = class RoutesController {
    create(companyId, dto) {
        return this.routesService.create(companyId, dto);
    }
    findAll(companyId, technicianId) {
        return this.routesService.findAll(companyId, technicianId);
    }
    findOne(companyId, id) {
        return this.routesService.findOne(companyId, id);
    }
    delete(companyId, id) {
        return this.routesService.delete(companyId, id);
    }
    constructor(routesService){
        this.routesService = routesService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createroutedto.CreateRouteDto === "undefined" ? Object : _createroutedto.CreateRouteDto
    ]),
    _ts_metadata("design:returntype", void 0)
], RoutesController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Query)('technicianId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], RoutesController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], RoutesController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _companyiddecorator.CompanyId)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], RoutesController.prototype, "delete", null);
RoutesController = _ts_decorate([
    (0, _common.Controller)('routes'),
    (0, _common.UseGuards)(_companycontextguard.CompanyContextGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _routesservice.RoutesService === "undefined" ? Object : _routesservice.RoutesService
    ])
], RoutesController);

//# sourceMappingURL=routes.controller.js.map