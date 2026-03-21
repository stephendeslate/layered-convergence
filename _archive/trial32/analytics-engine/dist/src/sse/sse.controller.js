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
exports.SseController = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const sse_service_js_1 = require("./sse.service.js");
let SseController = class SseController {
    sseService;
    constructor(sseService) {
        this.sseService = sseService;
    }
    dashboardUpdates(dashboardId) {
        return this.sseService.getDashboardStream(dashboardId);
    }
};
exports.SseController = SseController;
__decorate([
    (0, common_1.Sse)('dashboards/:dashboardId'),
    __param(0, (0, common_1.Param)('dashboardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], SseController.prototype, "dashboardUpdates", null);
exports.SseController = SseController = __decorate([
    (0, common_1.Controller)('sse'),
    __metadata("design:paramtypes", [sse_service_js_1.SseService])
], SseController);
//# sourceMappingURL=sse.controller.js.map