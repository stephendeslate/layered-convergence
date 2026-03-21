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
exports.DataPointController = void 0;
const common_1 = require("@nestjs/common");
const datapoint_service_js_1 = require("./datapoint.service.js");
const create_datapoint_dto_js_1 = require("./dto/create-datapoint.dto.js");
const query_datapoint_dto_js_1 = require("./dto/query-datapoint.dto.js");
let DataPointController = class DataPointController {
    dataPointService;
    constructor(dataPointService) {
        this.dataPointService = dataPointService;
    }
    create(req, dto) {
        return this.dataPointService.create(req.tenantId, dto);
    }
    query(req, query) {
        return this.dataPointService.query(req.tenantId, query);
    }
};
exports.DataPointController = DataPointController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_datapoint_dto_js_1.CreateDataPointDto]),
    __metadata("design:returntype", void 0)
], DataPointController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_datapoint_dto_js_1.QueryDataPointDto]),
    __metadata("design:returntype", void 0)
], DataPointController.prototype, "query", null);
exports.DataPointController = DataPointController = __decorate([
    (0, common_1.Controller)('datapoints'),
    __metadata("design:paramtypes", [datapoint_service_js_1.DataPointService])
], DataPointController);
//# sourceMappingURL=datapoint.controller.js.map