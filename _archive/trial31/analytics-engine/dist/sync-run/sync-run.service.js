"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SyncRunService", {
    enumerable: true,
    get: function() {
        return SyncRunService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma/prisma.service");
const _transitions = require("../common/constants/transitions");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SyncRunService = class SyncRunService {
    async create(dto) {
        return this.prisma.syncRun.create({
            data: {
                dataSourceId: dto.dataSourceId,
                status: 'pending'
            }
        });
    }
    async findAll(dataSourceId) {
        return this.prisma.syncRun.findMany({
            where: dataSourceId ? {
                dataSourceId
            } : undefined,
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async findOne(id) {
        return this.prisma.syncRun.findUniqueOrThrow({
            where: {
                id
            }
        });
    }
    async updateStatus(id, dto) {
        const current = await this.prisma.syncRun.findUniqueOrThrow({
            where: {
                id
            }
        });
        const allowed = _transitions.VALID_TRANSITIONS[current.status] || [];
        if (!allowed.includes(dto.status)) {
            throw new _common.BadRequestException(`Invalid status transition from '${current.status}' to '${dto.status}'`);
        }
        const updateData = {
            status: dto.status
        };
        if (dto.status === 'running') {
            updateData.startedAt = new Date();
        }
        if (dto.status === 'completed' || dto.status === 'failed') {
            updateData.completedAt = new Date();
        }
        if (dto.rowsIngested !== undefined) {
            updateData.rowsIngested = dto.rowsIngested;
        }
        if (dto.errorLog !== undefined) {
            updateData.errorLog = dto.errorLog;
        }
        return this.prisma.syncRun.update({
            where: {
                id
            },
            data: updateData
        });
    }
    async getHistory(dataSourceId, limit = 20) {
        return this.prisma.syncRun.findMany({
            where: {
                dataSourceId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });
    }
    async remove(id) {
        return this.prisma.syncRun.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
SyncRunService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], SyncRunService);

//# sourceMappingURL=sync-run.service.js.map