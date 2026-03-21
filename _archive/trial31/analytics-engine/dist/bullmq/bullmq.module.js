"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BullMqModule", {
    enumerable: true,
    get: function() {
        return BullMqModule;
    }
});
const _common = require("@nestjs/common");
const _bullmq = require("@nestjs/bullmq");
const _aggregationprocessor = require("./aggregation.processor");
const _syncprocessor = require("./sync.processor");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let BullMqModule = class BullMqModule {
};
BullMqModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _bullmq.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379', 10)
                }
            }),
            _bullmq.BullModule.registerQueue({
                name: 'aggregation'
            }, {
                name: 'sync'
            })
        ],
        providers: [
            _aggregationprocessor.AggregationProcessor,
            _syncprocessor.SyncProcessor
        ],
        exports: [
            _bullmq.BullModule
        ]
    })
], BullMqModule);

//# sourceMappingURL=bullmq.module.js.map