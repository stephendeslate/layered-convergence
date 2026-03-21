"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DataPointsController", {
    enumerable: true,
    get: function() {
        return DataPointsController;
    }
});
const _common = require("@nestjs/common");
const _datapointsservice = require("./data-points.service");
const _createdatapointdto = require("./dto/create-data-point.dto");
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
let DataPointsController = class DataPointsController {
    create(dto) {
        return this.dataPointsService.create(dto);
    }
    createMany(dtos) {
        return this.dataPointsService.createMany(dtos);
    }
    findByDataSource(dataSourceId, from, to) {
        return this.dataPointsService.findByDataSource(dataSourceId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
    }
    constructor(dataPointsService){
        this.dataPointsService = dataPointsService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createdatapointdto.CreateDataPointDto === "undefined" ? Object : _createdatapointdto.CreateDataPointDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DataPointsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Post)('batch'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Array
    ]),
    _ts_metadata("design:returntype", void 0)
], DataPointsController.prototype, "createMany", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('dataSourceId')),
    _ts_param(1, (0, _common.Query)('from')),
    _ts_param(2, (0, _common.Query)('to')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataPointsController.prototype, "findByDataSource", null);
DataPointsController = _ts_decorate([
    (0, _common.Controller)('data-points'),
    (0, _common.UseFilters)(_prismaexceptionfilter.PrismaExceptionFilter),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _datapointsservice.DataPointsService === "undefined" ? Object : _datapointsservice.DataPointsService
    ])
], DataPointsController);

//# sourceMappingURL=data-points.controller.js.map