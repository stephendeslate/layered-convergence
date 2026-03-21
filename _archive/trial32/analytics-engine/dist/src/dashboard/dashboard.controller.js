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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_js_1 = require("./dashboard.service.js");
const create_dashboard_dto_js_1 = require("./dto/create-dashboard.dto.js");
const update_dashboard_dto_js_1 = require("./dto/update-dashboard.dto.js");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    create(req, dto) {
        return this.dashboardService.create(req.tenantId, dto);
    }
    findAll(req) {
        return this.dashboardService.findAll(req.tenantId);
    }
    findOne(req, id) {
        return this.dashboardService.findOne(req.tenantId, id);
    }
    update(req, id, dto) {
        return this.dashboardService.update(req.tenantId, id, dto);
    }
    remove(req, id) {
        return this.dashboardService.remove(req.tenantId, id);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_dashboard_dto_js_1.CreateDashboardDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_dashboard_dto_js_1.UpdateDashboardDto]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "remove", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboards'),
    __metadata("design:paramtypes", [dashboard_service_js_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map