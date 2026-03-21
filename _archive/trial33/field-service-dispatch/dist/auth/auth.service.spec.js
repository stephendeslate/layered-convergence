"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _authservice = require("./auth.service");
const _common = require("@nestjs/common");
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
(0, _vitest.describe)('AuthService', ()=>{
    let service;
    let prisma;
    (0, _vitest.beforeEach)(()=>{
        prisma = {
            user: {
                findUnique: _vitest.vi.fn(),
                create: _vitest.vi.fn()
            }
        };
        service = new _authservice.AuthService(prisma);
    });
    (0, _vitest.describe)('register', ()=>{
        (0, _vitest.it)('should create a new user and return token', async ()=>{
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                name: 'Test User',
                role: 'DISPATCHER',
                companyId: 'company-1',
                password: 'hashed'
            });
            const result = await service.register({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                companyId: 'company-1'
            });
            (0, _vitest.expect)(result.user.email).toBe('test@example.com');
            (0, _vitest.expect)(result.token).toBeDefined();
            (0, _vitest.expect)(result.token.split('.')).toHaveLength(3);
        });
        (0, _vitest.it)('should throw ConflictException if email already exists', async ()=>{
            prisma.user.findUnique.mockResolvedValue({
                id: 'existing'
            });
            await (0, _vitest.expect)(service.register({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                companyId: 'company-1'
            })).rejects.toThrow(_common.ConflictException);
        });
        (0, _vitest.it)('should use default role DISPATCHER when not provided', async ()=>{
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                name: 'Test',
                role: 'DISPATCHER',
                companyId: 'company-1',
                password: 'hashed'
            });
            await service.register({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test',
                companyId: 'company-1'
            });
            (0, _vitest.expect)(prisma.user.create).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                data: _vitest.expect.objectContaining({
                    role: 'DISPATCHER'
                })
            }));
        });
        (0, _vitest.it)('should hash password before storing', async ()=>{
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                name: 'Test',
                role: 'DISPATCHER',
                companyId: 'company-1',
                password: 'hashed'
            });
            await service.register({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test',
                companyId: 'company-1'
            });
            (0, _vitest.expect)(prisma.user.create).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                data: _vitest.expect.objectContaining({
                    password: _vitest.expect.not.stringContaining('password123')
                })
            }));
        });
    });
    (0, _vitest.describe)('login', ()=>{
        (0, _vitest.it)('should return user and token for valid credentials', async ()=>{
            const { createHash } = await Promise.resolve().then(()=>/*#__PURE__*/ _interop_require_wildcard(require("crypto")));
            const hashedPassword = createHash('sha256').update('password123').digest('hex');
            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                name: 'Test User',
                role: 'ADMIN',
                companyId: 'company-1',
                password: hashedPassword
            });
            const result = await service.login({
                email: 'test@example.com',
                password: 'password123'
            });
            (0, _vitest.expect)(result.user.email).toBe('test@example.com');
            (0, _vitest.expect)(result.token).toBeDefined();
        });
        (0, _vitest.it)('should throw UnauthorizedException for non-existent user', async ()=>{
            prisma.user.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.login({
                email: 'nope@example.com',
                password: 'pass'
            })).rejects.toThrow(_common.UnauthorizedException);
        });
        (0, _vitest.it)('should throw UnauthorizedException for wrong password', async ()=>{
            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                password: 'differenthash'
            });
            await (0, _vitest.expect)(service.login({
                email: 'test@example.com',
                password: 'wrong'
            })).rejects.toThrow(_common.UnauthorizedException);
        });
    });
    (0, _vitest.describe)('validateUser', ()=>{
        (0, _vitest.it)('should return user data for valid userId', async ()=>{
            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                name: 'Test User',
                role: 'ADMIN',
                companyId: 'company-1'
            });
            const result = await service.validateUser('user-1');
            (0, _vitest.expect)(result.id).toBe('user-1');
            (0, _vitest.expect)(result.email).toBe('test@example.com');
        });
        (0, _vitest.it)('should throw UnauthorizedException for non-existent user', async ()=>{
            prisma.user.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.validateUser('nonexistent')).rejects.toThrow(_common.UnauthorizedException);
        });
    });
});

//# sourceMappingURL=auth.service.spec.js.map