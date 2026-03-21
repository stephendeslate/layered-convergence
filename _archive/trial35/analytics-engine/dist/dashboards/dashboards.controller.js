"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DashboardsController", {
    enumerable: true,
    get: function() {
        return DashboardsController;
    }
});
const _common = require("@nestjs/common");
const _dashboardsservice = require("./dashboards.service");
const _createdashboarddto = require("./dto/create-dashboard.dto");
const _updatedashboarddto = require("./dto/update-dashboard.dto");
const _prismaexceptionfilter = require("../common/filters/prisma-exception.filter");
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
let DashboardsController = class DashboardsController {
    create(dto) {
        return this.dashboardsService.create(dto);
    }
    findAll(tenantId) {
        return this.dashboardsService.findAll(tenantId);
    }
    findById(id) {
        return this.dashboardsService.findById(id);
    }
    update(id, dto) {
        return this.dashboardsService.update(id, dto);
    }
    remove(id) {
        return this.dashboardsService.remove(id);
    }
    constructor(dashboardsService){
        this.dashboardsService = dashboardsService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createdashboarddto.CreateDashboardDto === "undefined" ? Object : _createdashboarddto.CreateDashboardDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DashboardsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('tenantId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DashboardsController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DashboardsController.prototype, "findById", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatedashboarddto.UpdateDashboardDto === "undefined" ? Object : _updatedashboarddto.UpdateDashboardDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DashboardsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DashboardsController.prototype, "remove", null);
DashboardsController = _ts_decorate([
    (0, _common.Controller)('dashboards'),
    (0, _common.UseFilters)(_prismaexceptionfilter.PrismaExceptionFilter),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dashboardsservice.DashboardsService === "undefined" ? Object : _dashboardsservice.DashboardsService
    ])
], DashboardsController);

//# sourceMappingURL=dashboards.controller.js.map