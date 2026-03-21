"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DataPointController", {
    enumerable: true,
    get: function() {
        return DataPointController;
    }
});
const _common = require("@nestjs/common");
const _datapointservice = require("./data-point.service");
const _createdatapointdto = require("./dto/create-data-point.dto");
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
let DataPointController = class DataPointController {
    create(dto) {
        return this.dataPointService.create(dto);
    }
    findAll(dataSourceId) {
        return this.dataPointService.findAll(dataSourceId);
    }
    findOne(id) {
        return this.dataPointService.findOne(id);
    }
    remove(id) {
        return this.dataPointService.remove(id);
    }
    constructor(dataPointService){
        this.dataPointService = dataPointService;
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
], DataPointController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('dataSourceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataPointController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataPointController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DataPointController.prototype, "remove", null);
DataPointController = _ts_decorate([
    (0, _common.Controller)('data-points'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _datapointservice.DataPointService === "undefined" ? Object : _datapointservice.DataPointService
    ])
], DataPointController);

//# sourceMappingURL=data-point.controller.js.map