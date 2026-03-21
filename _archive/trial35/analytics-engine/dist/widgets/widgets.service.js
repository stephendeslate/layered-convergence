"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WidgetsService", {
    enumerable: true,
    get: function() {
        return WidgetsService;
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
let WidgetsService = class WidgetsService {
    async create(dto) {
        return this.prisma.widget.create({
            data: {
                dashboardId: dto.dashboardId,
                type: dto.type,
                config: dto.config,
                positionX: dto.positionX ?? 0,
                positionY: dto.positionY ?? 0,
                width: dto.width ?? 1,
                height: dto.height ?? 1
            }
        });
    }
    async findByDashboard(dashboardId) {
        return this.prisma.widget.findMany({
            where: {
                dashboardId
            }
        });
    }
    async findById(id) {
        const widget = await this.prisma.widget.findUnique({
            where: {
                id
            }
        });
        if (!widget) {
            throw new _common.NotFoundException(`Widget ${id} not found`);
        }
        return widget;
    }
    async update(id, dto) {
        return this.prisma.widget.update({
            where: {
                id
            },
            data: {
                ...dto.type && {
                    type: dto.type
                },
                ...dto.config !== undefined && {
                    config: dto.config
                },
                ...dto.positionX !== undefined && {
                    positionX: dto.positionX
                },
                ...dto.positionY !== undefined && {
                    positionY: dto.positionY
                },
                ...dto.width !== undefined && {
                    width: dto.width
                },
                ...dto.height !== undefined && {
                    height: dto.height
                }
            }
        });
    }
    async remove(id) {
        return this.prisma.widget.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
WidgetsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], WidgetsService);

//# sourceMappingURL=widgets.service.js.map