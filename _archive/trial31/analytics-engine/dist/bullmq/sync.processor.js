"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SyncProcessor", {
    enumerable: true,
    get: function() {
        return SyncProcessor;
    }
});
const _bullmq = require("@nestjs/bullmq");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let SyncProcessor = class SyncProcessor extends _bullmq.WorkerHost {
    async process(job) {
        const { dataSourceId, syncRunId } = job.data;
        await job.log(`Processing sync for data source ${dataSourceId}, run ${syncRunId}`);
    }
};
SyncProcessor = _ts_decorate([
    (0, _bullmq.Processor)('sync')
], SyncProcessor);

//# sourceMappingURL=sync.processor.js.map