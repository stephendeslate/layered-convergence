"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WidgetsController", {
    enumerable: true,
    get: function() {
        return WidgetsController;
    }
});
const _common = require("@nestjs/common");
const _widgetsservice = require("./widgets.service");
const _createwidgetdto = require("./dto/create-widget.dto");
const _updatewidgetdto = require("./dto/update-widget.dto");
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
let WidgetsController = class WidgetsController {
    create(dto) {
        return this.widgetsService.create(dto);
    }
    findByDashboard(dashboardId) {
        return this.widgetsService.findByDashboard(dashboardId);
    }
    findById(id) {
        return this.widgetsService.findById(id);
    }
    update(id, dto) {
        return this.widgetsService.update(id, dto);
    }
    remove(id) {
        return this.widgetsService.remove(id);
    }
    constructor(widgetsService){
        this.widgetsService = widgetsService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createwidgetdto.CreateWidgetDto === "undefined" ? Object : _createwidgetdto.CreateWidgetDto
    ]),
    _ts_metadata("design:returntype", void 0)
], WidgetsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('dashboardId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WidgetsController.prototype, "findByDashboard", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WidgetsController.prototype, "findById", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatewidgetdto.UpdateWidgetDto === "undefined" ? Object : _updatewidgetdto.UpdateWidgetDto
    ]),
    _ts_metadata("design:returntype", void 0)
], WidgetsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WidgetsController.prototype, "remove", null);
WidgetsController = _ts_decorate([
    (0, _common.Controller)('widgets'),
    (0, _common.UseFilters)(_prismaexceptionfilter.PrismaExceptionFilter),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _widgetsservice.WidgetsService === "undefined" ? Object : _widgetsservice.WidgetsService
    ])
], WidgetsController);

//# sourceMappingURL=widgets.controller.js.map