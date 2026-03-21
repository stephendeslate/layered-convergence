"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "IngestionController", {
    enumerable: true,
    get: function() {
        return IngestionController;
    }
});
const _common = require("@nestjs/common");
const _ingestionservice = require("./ingestion.service");
const _ingestwebhookdto = require("./dto/ingest-webhook.dto");
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
let IngestionController = class IngestionController {
    ingestWebhook(dataSourceId, dto) {
        return this.ingestionService.ingestWebhook(dataSourceId, dto);
    }
    ingestBatch(dataSourceId, events) {
        return this.ingestionService.ingestBatch(dataSourceId, events);
    }
    constructor(ingestionService){
        this.ingestionService = ingestionService;
    }
};
_ts_decorate([
    (0, _common.Post)(':dataSourceId/webhook'),
    _ts_param(0, (0, _common.Param)('dataSourceId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _ingestwebhookdto.IngestWebhookDto === "undefined" ? Object : _ingestwebhookdto.IngestWebhookDto
    ]),
    _ts_metadata("design:returntype", void 0)
], IngestionController.prototype, "ingestWebhook", null);
_ts_decorate([
    (0, _common.Post)(':dataSourceId/batch'),
    _ts_param(0, (0, _common.Param)('dataSourceId')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Array
    ]),
    _ts_metadata("design:returntype", void 0)
], IngestionController.prototype, "ingestBatch", null);
IngestionController = _ts_decorate([
    (0, _common.Controller)('ingest'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _ingestionservice.IngestionService === "undefined" ? Object : _ingestionservice.IngestionService
    ])
], IngestionController);

//# sourceMappingURL=ingestion.controller.js.map