"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SyncRunsService", {
    enumerable: true,
    get: function() {
        return SyncRunsService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma/prisma.service");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SyncRunsService = class SyncRunsService {
    async create(dto) {
        return this.prisma.syncRun.create({
            data: {
                dataSourceId: dto.dataSourceId,
                status: _client.SyncStatus.RUNNING
            }
        });
    }
    async findByDataSource(dataSourceId) {
        return this.prisma.syncRun.findMany({
            where: {
                dataSourceId
            },
            orderBy: {
                startedAt: 'desc'
            }
        });
    }
    async findById(id) {
        const run = await this.prisma.syncRun.findUnique({
            where: {
                id
            }
        });
        if (!run) {
            throw new _common.NotFoundException(`SyncRun ${id} not found`);
        }
        return run;
    }
    async complete(id, rowsIngested) {
        return this.prisma.syncRun.update({
            where: {
                id
            },
            data: {
                status: _client.SyncStatus.COMPLETED,
                rowsIngested,
                completedAt: new Date()
            }
        });
    }
    async fail(id, errorLog) {
        return this.prisma.syncRun.update({
            where: {
                id
            },
            data: {
                status: _client.SyncStatus.FAILED,
                errorLog,
                completedAt: new Date()
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
SyncRunsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], SyncRunsService);

//# sourceMappingURL=sync-runs.service.js.map