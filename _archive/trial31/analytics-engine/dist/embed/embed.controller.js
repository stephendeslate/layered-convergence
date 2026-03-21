"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EmbedController", {
    enumerable: true,
    get: function() {
        return EmbedController;
    }
});
const _common = require("@nestjs/common");
const _embedservice = require("./embed.service");
const _createembedconfigdto = require("./dto/create-embed-config.dto");
const _updateembedconfigdto = require("./dto/update-embed-config.dto");
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
let EmbedController = class EmbedController {
    create(dto) {
        return this.embedService.create(dto);
    }
    findByDashboard(dashboardId) {
        return this.embedService.findByDashboard(dashboardId);
    }
    findOne(id) {
        return this.embedService.findOne(id);
    }
    update(id, dto) {
        return this.embedService.update(id, dto);
    }
    remove(id) {
        return this.embedService.remove(id);
    }
    constructor(embedService){
        this.embedService = embedService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createembedconfigdto.CreateEmbedConfigDto === "undefined" ? Object : _createembedconfigdto.CreateEmbedConfigDto
    ]),
    _ts_metadata("design:returntype", void 0)
], EmbedController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('dashboardId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], EmbedController.prototype, "findByDashboard", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], EmbedController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updateembedconfigdto.UpdateEmbedConfigDto === "undefined" ? Object : _updateembedconfigdto.UpdateEmbedConfigDto
    ]),
    _ts_metadata("design:returntype", void 0)
], EmbedController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], EmbedController.prototype, "remove", null);
EmbedController = _ts_decorate([
    (0, _common.Controller)('embed-configs'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _embedservice.EmbedService === "undefined" ? Object : _embedservice.EmbedService
    ])
], EmbedController);

//# sourceMappingURL=embed.controller.js.map