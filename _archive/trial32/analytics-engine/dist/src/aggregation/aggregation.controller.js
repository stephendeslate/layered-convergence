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
exports.AggregationController = void 0;
const common_1 = require("@nestjs/common");
const aggregation_service_js_1 = require("./aggregation.service.js");
const aggregation_query_dto_js_1 = require("./dto/aggregation-query.dto.js");
let AggregationController = class AggregationController {
    aggregationService;
    constructor(aggregationService) {
        this.aggregationService = aggregationService;
    }
    aggregate(req, query) {
        return this.aggregationService.aggregate(req.tenantId, query.dataSourceId, query.bucket, query.startDate, query.endDate, query.metricKey);
    }
};
exports.AggregationController = AggregationController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, aggregation_query_dto_js_1.AggregationQueryDto]),
    __metadata("design:returntype", void 0)
], AggregationController.prototype, "aggregate", null);
exports.AggregationController = AggregationController = __decorate([
    (0, common_1.Controller)('aggregations'),
    __metadata("design:paramtypes", [aggregation_service_js_1.AggregationService])
], AggregationController);
//# sourceMappingURL=aggregation.controller.js.map