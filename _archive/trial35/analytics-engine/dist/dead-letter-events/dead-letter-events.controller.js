"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DeadLetterEventsController", {
    enumerable: true,
    get: function() {
        return DeadLetterEventsController;
    }
});
const _common = require("@nestjs/common");
const _deadlettereventsservice = require("./dead-letter-events.service");
const _createdeadlettereventdto = require("./dto/create-dead-letter-event.dto");
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
let DeadLetterEventsController = class DeadLetterEventsController {
    create(dto) {
        return this.service.create(dto);
    }
    findByDataSource(dataSourceId) {
        return this.service.findByDataSource(dataSourceId);
    }
    findById(id) {
        return this.service.findById(id);
    }
    retry(id) {
        return this.service.retry(id);
    }
    remove(id) {
        return this.service.remove(id);
    }
    constructor(service){
        this.service = service;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createdeadlettereventdto.CreateDeadLetterEventDto === "undefined" ? Object : _createdeadlettereventdto.CreateDeadLetterEventDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DeadLetterEventsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('dataSourceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DeadLetterEventsController.prototype, "findByDataSource", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DeadLetterEventsController.prototype, "findById", null);
_ts_decorate([
    (0, _common.Patch)(':id/retry'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DeadLetterEventsController.prototype, "retry", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DeadLetterEventsController.prototype, "remove", null);
DeadLetterEventsController = _ts_decorate([
    (0, _common.Controller)('dead-letter-events'),
    (0, _common.UseFilters)(_prismaexceptionfilter.PrismaExceptionFilter),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _deadlettereventsservice.DeadLetterEventsService === "undefined" ? Object : _deadlettereventsservice.DeadLetterEventsService
    ])
], DeadLetterEventsController);

//# sourceMappingURL=dead-letter-events.controller.js.map