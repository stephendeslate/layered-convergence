"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DeadLetterEventsService", {
    enumerable: true,
    get: function() {
        return DeadLetterEventsService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let DeadLetterEventsService = class DeadLetterEventsService {
    async create(dto) {
        return this.prisma.deadLetterEvent.create({
            data: {
                dataSourceId: dto.dataSourceId,
                payload: dto.payload,
                errorReason: dto.errorReason
            }
        });
    }
    async findByDataSource(dataSourceId) {
        return this.prisma.deadLetterEvent.findMany({
            where: {
                dataSourceId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async findById(id) {
        const event = await this.prisma.deadLetterEvent.findUnique({
            where: {
                id
            }
        });
        if (!event) {
            throw new _common.NotFoundException(`DeadLetterEvent ${id} not found`);
        }
        return event;
    }
    async retry(id) {
        return this.prisma.deadLetterEvent.update({
            where: {
                id
            },
            data: {
                retriedAt: new Date()
            }
        });
    }
    async remove(id) {
        return this.prisma.deadLetterEvent.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
DeadLetterEventsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], DeadLetterEventsService);

//# sourceMappingURL=dead-letter-events.service.js.map