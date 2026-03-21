"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WidgetService", {
    enumerable: true,
    get: function() {
        return WidgetService;
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
let WidgetService = class WidgetService {
    async create(dto) {
        return this.prisma.widget.create({
            data: dto
        });
    }
    async findAll(dashboardId) {
        return this.prisma.widget.findMany({
            where: dashboardId ? {
                dashboardId
            } : undefined
        });
    }
    async findOne(id) {
        return this.prisma.widget.findUniqueOrThrow({
            where: {
                id
            }
        });
    }
    async update(id, dto) {
        return this.prisma.widget.update({
            where: {
                id
            },
            data: dto
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
WidgetService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], WidgetService);

//# sourceMappingURL=widget.service.js.map