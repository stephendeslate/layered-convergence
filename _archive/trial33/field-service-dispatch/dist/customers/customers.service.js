"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CustomersService", {
    enumerable: true,
    get: function() {
        return CustomersService;
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
let CustomersService = class CustomersService {
    async create(companyId, dto) {
        return this.prisma.customer.create({
            data: {
                companyId,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                address: dto.address,
                lat: dto.lat,
                lng: dto.lng
            }
        });
    }
    async findAll(companyId) {
        return this.prisma.customer.findMany({
            where: {
                companyId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async findOne(companyId, id) {
        const customer = await this.prisma.customer.findFirst({
            where: {
                id,
                companyId
            }
        });
        if (!customer) {
            throw new _common.NotFoundException(`Customer ${id} not found`);
        }
        return customer;
    }
    async update(companyId, id, dto) {
        await this.findOne(companyId, id);
        return this.prisma.customer.update({
            where: {
                id
            },
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                address: dto.address,
                lat: dto.lat,
                lng: dto.lng
            }
        });
    }
    async delete(companyId, id) {
        await this.findOne(companyId, id);
        return this.prisma.customer.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
CustomersService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], CustomersService);

//# sourceMappingURL=customers.service.js.map