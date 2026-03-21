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
exports.QueryCacheController = void 0;
const common_1 = require("@nestjs/common");
const query_cache_service_js_1 = require("./query-cache.service.js");
let QueryCacheController = class QueryCacheController {
    queryCacheService;
    constructor(queryCacheService) {
        this.queryCacheService = queryCacheService;
    }
    get(queryHash) {
        return this.queryCacheService.get(queryHash);
    }
    set(body) {
        const queryHash = this.queryCacheService.generateHash(body.query);
        return this.queryCacheService.set(queryHash, body.result, body.ttlSeconds);
    }
    invalidate(queryHash) {
        return this.queryCacheService.invalidate(queryHash);
    }
    invalidateAll() {
        return this.queryCacheService.invalidateAll();
    }
};
exports.QueryCacheController = QueryCacheController;
__decorate([
    (0, common_1.Get)(':queryHash'),
    __param(0, (0, common_1.Param)('queryHash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QueryCacheController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], QueryCacheController.prototype, "set", null);
__decorate([
    (0, common_1.Delete)(':queryHash'),
    __param(0, (0, common_1.Param)('queryHash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QueryCacheController.prototype, "invalidate", null);
__decorate([
    (0, common_1.Delete)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QueryCacheController.prototype, "invalidateAll", null);
exports.QueryCacheController = QueryCacheController = __decorate([
    (0, common_1.Controller)('query-cache'),
    __metadata("design:paramtypes", [query_cache_service_js_1.QueryCacheService])
], QueryCacheController);
//# sourceMappingURL=query-cache.controller.js.map