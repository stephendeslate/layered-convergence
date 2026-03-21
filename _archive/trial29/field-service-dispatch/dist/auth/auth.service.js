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
const _prismaservice = require("../prisma/prisma.service");
const _crypto = require("crypto");
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
        const existing = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (existing) {
            throw new _common.ConflictException('Email already registered');
        }
        const hashedPassword = this.hashPassword(dto.password);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: hashedPassword,
                companyId: dto.companyId,
                role: dto.role || 'DISPATCHER'
            }
        });
        const token = this.generateToken(user);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyId: user.companyId
            },
            token
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if (!user) {
            throw new _common.UnauthorizedException('Invalid credentials');
        }
        const hashedPassword = this.hashPassword(dto.password);
        if (user.password !== hashedPassword) {
            throw new _common.UnauthorizedException('Invalid credentials');
        }
        const token = this.generateToken(user);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyId: user.companyId
            },
            token
        };
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            throw new _common.UnauthorizedException('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId
        };
    }
    hashPassword(password) {
        return (0, _crypto.createHash)('sha256').update(password).digest('hex');
    }
    generateToken(user) {
        const header = Buffer.from(JSON.stringify({
            alg: 'HS256',
            typ: 'JWT'
        })).toString('base64url');
        const payload = Buffer.from(JSON.stringify({
            sub: user.id,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 86400
        })).toString('base64url');
        const signature = (0, _crypto.createHash)('sha256').update(`${header}.${payload}`).digest('base64url');
        return `${header}.${payload}.${signature}`;
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map