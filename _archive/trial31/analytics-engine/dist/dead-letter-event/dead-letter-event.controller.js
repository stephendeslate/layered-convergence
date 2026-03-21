"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DeadLetterEventController", {
    enumerable: true,
    get: function() {
        return DeadLetterEventController;
    }
});
const _common = require("@nestjs/common");
const _deadlettereventservice = require("./dead-letter-event.service");
const _createdeadlettereventdto = require("./dto/create-dead-letter-event.dto");
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
let DeadLetterEventController = class DeadLetterEventController {
    create(dto) {
        return this.service.create(dto);
    }
    findAll(dataSourceId) {
        return this.service.findAll(dataSourceId);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    markRetried(id) {
        return this.service.markRetried(id);
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
], DeadLetterEventController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('dataSourceId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DeadLetterEventController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DeadLetterEventController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(':id/retry'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DeadLetterEventController.prototype, "markRetried", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], DeadLetterEventController.prototype, "remove", null);
DeadLetterEventController = _ts_decorate([
    (0, _common.Controller)('dead-letter-events'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _deadlettereventservice.DeadLetterEventService === "undefined" ? Object : _deadlettereventservice.DeadLetterEventService
    ])
], DeadLetterEventController);

//# sourceMappingURL=dead-letter-event.controller.js.map