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
exports.WidgetController = void 0;
const common_1 = require("@nestjs/common");
const widget_service_js_1 = require("./widget.service.js");
const create_widget_dto_js_1 = require("./dto/create-widget.dto.js");
const update_widget_dto_js_1 = require("./dto/update-widget.dto.js");
let WidgetController = class WidgetController {
    widgetService;
    constructor(widgetService) {
        this.widgetService = widgetService;
    }
    create(dto) {
        return this.widgetService.create(dto);
    }
    findAllByDashboard(dashboardId) {
        return this.widgetService.findAllByDashboard(dashboardId);
    }
    findOne(id) {
        return this.widgetService.findOne(id);
    }
    update(id, dto) {
        return this.widgetService.update(id, dto);
    }
    remove(id) {
        return this.widgetService.remove(id);
    }
};
exports.WidgetController = WidgetController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_widget_dto_js_1.CreateWidgetDto]),
    __metadata("design:returntype", void 0)
], WidgetController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('dashboardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WidgetController.prototype, "findAllByDashboard", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WidgetController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_widget_dto_js_1.UpdateWidgetDto]),
    __metadata("design:returntype", void 0)
], WidgetController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WidgetController.prototype, "remove", null);
exports.WidgetController = WidgetController = __decorate([
    (0, common_1.Controller)('widgets'),
    __metadata("design:paramtypes", [widget_service_js_1.WidgetService])
], WidgetController);
//# sourceMappingURL=widget.controller.js.map