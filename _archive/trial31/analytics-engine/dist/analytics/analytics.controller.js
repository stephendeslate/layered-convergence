"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AnalyticsController", {
    enumerable: true,
    get: function() {
        return AnalyticsController;
    }
});
const _common = require("@nestjs/common");
const _analyticsservice = require("./analytics.service");
const _queryanalyticsdto = require("./dto/query-analytics.dto");
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
let AnalyticsController = class AnalyticsController {
    query(dto) {
        return this.analyticsService.query(dto);
    }
    getKpi(dataSourceId) {
        return this.analyticsService.getKpi(dataSourceId);
    }
    constructor(analyticsService){
        this.analyticsService = analyticsService;
    }
};
_ts_decorate([
    (0, _common.Get)('query'),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _queryanalyticsdto.QueryAnalyticsDto === "undefined" ? Object : _queryanalyticsdto.QueryAnalyticsDto
    ]),
    _ts_metadata("design:returntype", void 0)
], AnalyticsController.prototype, "query", null);
_ts_decorate([
    (0, _common.Get)('kpi'),
    _ts_param(0, (0, _common.Query)('dataSourceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getKpi", null);
AnalyticsController = _ts_decorate([
    (0, _common.Controller)('analytics'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _analyticsservice.AnalyticsService === "undefined" ? Object : _analyticsservice.AnalyticsService
    ])
], AnalyticsController);

//# sourceMappingURL=analytics.controller.js.map