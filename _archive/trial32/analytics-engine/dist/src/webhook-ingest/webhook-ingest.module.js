"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookIngestModule = void 0;
const common_1 = require("@nestjs/common");
const webhook_ingest_service_js_1 = require("./webhook-ingest.service.js");
const webhook_ingest_controller_js_1 = require("./webhook-ingest.controller.js");
const datapoint_module_js_1 = require("../datapoint/datapoint.module.js");
const pipeline_module_js_1 = require("../pipeline/pipeline.module.js");
let WebhookIngestModule = class WebhookIngestModule {
};
exports.WebhookIngestModule = WebhookIngestModule;
exports.WebhookIngestModule = WebhookIngestModule = __decorate([
    (0, common_1.Module)({
        imports: [datapoint_module_js_1.DataPointModule, pipeline_module_js_1.PipelineModule],
        controllers: [webhook_ingest_controller_js_1.WebhookIngestController],
        providers: [webhook_ingest_service_js_1.WebhookIngestService],
    })
], WebhookIngestModule);
//# sourceMappingURL=webhook-ingest.module.js.map