"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _authservice = require("./auth.service");
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
const mockPrisma = {
    user: {
        findUnique: _vitest.vi.fn(),
        create: _vitest.vi.fn()
    }
};
(0, _vitest.describe)('AuthService', ()=>{
    let service;
    (0, _vitest.beforeEach)(async ()=>{
        _vitest.vi.clearAllMocks();
        const module = await _testing.Test.createTestingModule({
            providers: [
                _authservice.AuthService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();
        service = module.get(_authservice.AuthService);
    });
    (0, _vitest.describe)('register', ()=>{
        (0, _vitest.it)('should register a new user and return token', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({
                id: 'u1',
                email: 'test@test.com',
                name: 'Test',
                password: 'hashed',
                role: 'DISPATCHER',
                companyId: 'comp1'
            });
            const result = await service.register({
                email: 'test@test.com',
                name: 'Test',
                password: 'password123',
                companyId: 'comp1'
            });
            (0, _vitest.expect)(result.user.email).toBe('test@test.com');
            (0, _vitest.expect)(result.token).toBeDefined();
            (0, _vitest.expect)(result.token.split('.')).toHaveLength(3);
        });
        (0, _vitest.it)('should throw ConflictException if email exists', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'u1'
            });
            await (0, _vitest.expect)(service.register({
                email: 'test@test.com',
                name: 'Test',
                password: 'password123',
                companyId: 'comp1'
            })).rejects.toThrow(_common.ConflictException);
        });
    });
    (0, _vitest.describe)('login', ()=>{
        (0, _vitest.it)('should login with correct credentials', async ()=>{
            const { createHash } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("crypto")));
            const hashedPassword = createHash('sha256').update('password123').digest('hex');
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'u1',
                email: 'test@test.com',
                name: 'Test',
                password: hashedPassword,
                role: 'DISPATCHER',
                companyId: 'comp1'
            });
            const result = await service.login({
                email: 'test@test.com',
                password: 'password123'
            });
            (0, _vitest.expect)(result.user.email).toBe('test@test.com');
            (0, _vitest.expect)(result.token).toBeDefined();
        });
        (0, _vitest.it)('should throw UnauthorizedException for unknown email', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.login({
                email: 'unknown@test.com',
                password: 'x'
            })).rejects.toThrow(_common.UnauthorizedException);
        });
        (0, _vitest.it)('should throw UnauthorizedException for wrong password', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'u1',
                email: 'test@test.com',
                password: 'wronghash',
                role: 'DISPATCHER',
                companyId: 'comp1'
            });
            await (0, _vitest.expect)(service.login({
                email: 'test@test.com',
                password: 'password123'
            })).rejects.toThrow(_common.UnauthorizedException);
        });
    });
    (0, _vitest.describe)('validateUser', ()=>{
        (0, _vitest.it)('should return user data', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'u1',
                email: 'test@test.com',
                name: 'Test',
                role: 'DISPATCHER',
                companyId: 'comp1'
            });
            const result = await service.validateUser('u1');
            (0, _vitest.expect)(result.id).toBe('u1');
        });
        (0, _vitest.it)('should throw UnauthorizedException if user not found', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.validateUser('u999')).rejects.toThrow(_common.UnauthorizedException);
        });
    });
});

//# sourceMappingURL=auth.service.spec.js.map