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
exports.EmbedController = void 0;
const common_1 = require("@nestjs/common");
const embed_service_js_1 = require("./embed.service.js");
const create_embed_config_dto_js_1 = require("./dto/create-embed-config.dto.js");
const update_embed_config_dto_js_1 = require("./dto/update-embed-config.dto.js");
let EmbedController = class EmbedController {
    embedService;
    constructor(embedService) {
        this.embedService = embedService;
    }
    createConfig(dto) {
        return this.embedService.createConfig(dto);
    }
    getConfig(dashboardId) {
        return this.embedService.getConfig(dashboardId);
    }
    updateConfig(dashboardId, dto) {
        return this.embedService.updateConfig(dashboardId, dto);
    }
    renderByApiKey(apiKey) {
        return this.embedService.renderByApiKey(apiKey);
    }
};
exports.EmbedController = EmbedController;
__decorate([
    (0, common_1.Post)('config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_embed_config_dto_js_1.CreateEmbedConfigDto]),
    __metadata("design:returntype", void 0)
], EmbedController.prototype, "createConfig", null);
__decorate([
    (0, common_1.Get)('config/:dashboardId'),
    __param(0, (0, common_1.Param)('dashboardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmbedController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)('config/:dashboardId'),
    __param(0, (0, common_1.Param)('dashboardId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_embed_config_dto_js_1.UpdateEmbedConfigDto]),
    __metadata("design:returntype", void 0)
], EmbedController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Get)('render/:apiKey'),
    __param(0, (0, common_1.Param)('apiKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmbedController.prototype, "renderByApiKey", null);
exports.EmbedController = EmbedController = __decorate([
    (0, common_1.Controller)('embed'),
    __metadata("design:paramtypes", [embed_service_js_1.EmbedService])
], EmbedController);
//# sourceMappingURL=embed.controller.js.map