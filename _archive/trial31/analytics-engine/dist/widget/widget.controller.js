"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WidgetController", {
    enumerable: true,
    get: function() {
        return WidgetController;
    }
});
const _common = require("@nestjs/common");
const _widgetservice = require("./widget.service");
const _createwidgetdto = require("./dto/create-widget.dto");
const _updatewidgetdto = require("./dto/update-widget.dto");
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
let WidgetController = class WidgetController {
    create(dto) {
        return this.widgetService.create(dto);
    }
    findAll(dashboardId) {
        return this.widgetService.findAll(dashboardId);
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
    constructor(widgetService){
        this.widgetService = widgetService;
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
], WidgetController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('dashboardId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WidgetController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WidgetController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatewidgetdto.UpdateWidgetDto === "undefined" ? Object : _updatewidgetdto.UpdateWidgetDto
    ]),
    _ts_metadata("design:returntype", void 0)
], WidgetController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], WidgetController.prototype, "remove", null);
WidgetController = _ts_decorate([
    (0, _common.Controller)('widgets'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _widgetservice.WidgetService === "undefined" ? Object : _widgetservice.WidgetService
    ])
], WidgetController);

//# sourceMappingURL=widget.controller.js.map