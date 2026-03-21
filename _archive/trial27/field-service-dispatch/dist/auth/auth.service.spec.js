"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _authservice = require("./auth.service");
const _prismaservice = require("../prisma/prisma.service");
const _crypto = require("crypto");
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
    (0, _vitest.it)('should be defined', ()=>{
        (0, _vitest.expect)(service).toBeDefined();
    });
    (0, _vitest.describe)('register', ()=>{
        (0, _vitest.it)('should register a new user', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({
                id: 'u1',
                email: 'test@test.com',
                name: 'Test',
                role: 'DISPATCHER',
                companyId: 'comp-1',
                password: 'hashed'
            });
            const result = await service.register({
                email: 'test@test.com',
                password: 'pass123',
                name: 'Test',
                companyId: 'comp-1'
            });
            (0, _vitest.expect)(result.token).toBeDefined();
            (0, _vitest.expect)(result.user.email).toBe('test@test.com');
            (0, _vitest.expect)(result.user.id).toBe('u1');
        });
        (0, _vitest.it)('should throw ConflictException for existing email', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'u1'
            });
            await (0, _vitest.expect)(service.register({
                email: 'existing@test.com',
                password: 'pass',
                name: 'Dup',
                companyId: 'comp-1'
            })).rejects.toThrow(_common.ConflictException);
        });
        (0, _vitest.it)('should hash the password', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({
                id: 'u1',
                email: 'test@test.com',
                name: 'Test',
                role: 'DISPATCHER',
                companyId: 'comp-1'
            });
            await service.register({
                email: 'test@test.com',
                password: 'myPassword',
                name: 'Test',
                companyId: 'comp-1'
            });
            const expectedHash = (0, _crypto.createHash)('sha256').update('myPassword').digest('hex');
            (0, _vitest.expect)(mockPrisma.user.create).toHaveBeenCalledWith(_vitest.expect.objectContaining({
                data: _vitest.expect.objectContaining({
                    password: expectedHash
                })
            }));
        });
    });
    (0, _vitest.describe)('login', ()=>{
        (0, _vitest.it)('should login with correct credentials', async ()=>{
            const hashedPass = (0, _crypto.createHash)('sha256').update('pass123').digest('hex');
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'u1',
                email: 'user@test.com',
                name: 'User',
                role: 'ADMIN',
                companyId: 'comp-1',
                password: hashedPass
            });
            const result = await service.login({
                email: 'user@test.com',
                password: 'pass123'
            });
            (0, _vitest.expect)(result.token).toBeDefined();
            (0, _vitest.expect)(result.user.email).toBe('user@test.com');
        });
        (0, _vitest.it)('should throw UnauthorizedException for wrong password', async ()=>{
            const hashedPass = (0, _crypto.createHash)('sha256').update('correct').digest('hex');
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'u1',
                email: 'user@test.com',
                password: hashedPass
            });
            await (0, _vitest.expect)(service.login({
                email: 'user@test.com',
                password: 'wrong'
            })).rejects.toThrow(_common.UnauthorizedException);
        });
        (0, _vitest.it)('should throw UnauthorizedException for unknown email', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.login({
                email: 'nobody@test.com',
                password: 'pass'
            })).rejects.toThrow(_common.UnauthorizedException);
        });
    });
    (0, _vitest.describe)('validateUser', ()=>{
        (0, _vitest.it)('should return user data', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'u1',
                email: 'user@test.com',
                name: 'User',
                role: 'ADMIN',
                companyId: 'comp-1'
            });
            const result = await service.validateUser('u1');
            (0, _vitest.expect)(result.email).toBe('user@test.com');
        });
        (0, _vitest.it)('should throw UnauthorizedException for unknown user', async ()=>{
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await (0, _vitest.expect)(service.validateUser('bad')).rejects.toThrow(_common.UnauthorizedException);
        });
    });
});

//# sourceMappingURL=auth.service.spec.js.map