"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _bcrypt = /*#__PURE__*/ _interop_require_wildcard(require("bcrypt"));
const _tenantsservice = require("../tenants/tenants.service");
const _prismaservice = require("../prisma/prisma.service");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AuthService = class AuthService {
    async register(dto) {
        const existing = await this.prisma.tenant.findFirst({
            where: {
                name: dto.email
            }
        });
        if (existing) {
            throw new _common.ConflictException('Email already registered');
        }
        const passwordHash = await _bcrypt.hash(dto.password, 10);
        let tenantId = dto.tenantId;
        if (!tenantId) {
            const tenant = await this.tenantsService.create({
                name: dto.name
            });
            tenantId = tenant.id;
        }
        const token = this.generateToken({
            id: tenantId,
            email: dto.email,
            role: dto.role ?? 'ADMIN',
            tenantId
        });
        return {
            user: {
                id: tenantId,
                email: dto.email,
                name: dto.name,
                role: dto.role ?? 'ADMIN'
            },
            tenantId,
            token
        };
    }
    async login(dto) {
        const tenant = await this.prisma.tenant.findFirst({
            where: {
                apiKey: dto.email
            }
        });
        if (!tenant) {
            throw new _common.UnauthorizedException('Invalid credentials');
        }
        const token = this.generateToken({
            id: tenant.id,
            email: dto.email,
            role: 'ADMIN',
            tenantId: tenant.id
        });
        return {
            user: {
                id: tenant.id,
                email: dto.email,
                name: tenant.name,
                role: 'ADMIN'
            },
            tenantId: tenant.id,
            token
        };
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
        };
        return this.jwtService.sign(payload);
    }
    constructor(prisma, tenantsService, jwtService){
        this.prisma = prisma;
        this.tenantsService = tenantsService;
        this.jwtService = jwtService;
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantsservice.TenantsService === "undefined" ? Object : _tenantsservice.TenantsService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map