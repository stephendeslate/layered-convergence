"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _jwt = require("@nestjs/jwt");
const _common = require("@nestjs/common");
const _authservice = require("./auth.service");
const _tenantsservice = require("../tenants/tenants.service");
const _prismaservice = require("../prisma/prisma.service");
vi.mock('bcrypt', ()=>({
        hash: vi.fn().mockResolvedValue('hashed-password'),
        compare: vi.fn()
    }));
describe('AuthService', ()=>{
    let service;
    let prisma;
    let tenantsService;
    let jwtService;
    beforeEach(async ()=>{
        prisma = {
            tenant: {
                findFirst: vi.fn()
            }
        };
        tenantsService = {
            create: vi.fn().mockResolvedValue({
                id: 'tenant-1',
                name: 'Test',
                apiKey: 'key-1'
            })
        };
        jwtService = {
            sign: vi.fn().mockReturnValue('jwt-token')
        };
        const module = await _testing.Test.createTestingModule({
            providers: [
                _authservice.AuthService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: prisma
                },
                {
                    provide: _tenantsservice.TenantsService,
                    useValue: tenantsService
                },
                {
                    provide: _jwt.JwtService,
                    useValue: jwtService
                }
            ]
        }).compile();
        service = module.get(_authservice.AuthService);
    });
    describe('register', ()=>{
        it('should register and return token', async ()=>{
            prisma.tenant.findFirst.mockResolvedValue(null);
            const result = await service.register({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            });
            expect(result.token).toBe('jwt-token');
            expect(result.tenantId).toBe('tenant-1');
        });
        it('should throw ConflictException if email exists', async ()=>{
            prisma.tenant.findFirst.mockResolvedValue({
                id: 'existing'
            });
            await expect(service.register({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            })).rejects.toThrow(_common.ConflictException);
        });
        it('should create a new tenant when tenantId not provided', async ()=>{
            prisma.tenant.findFirst.mockResolvedValue(null);
            await service.register({
                email: 'new@example.com',
                password: 'password123',
                name: 'New User'
            });
            expect(tenantsService.create).toHaveBeenCalledWith({
                name: 'New User'
            });
        });
        it('should not create tenant when tenantId is provided', async ()=>{
            prisma.tenant.findFirst.mockResolvedValue(null);
            await service.register({
                email: 'new@example.com',
                password: 'password123',
                name: 'New User',
                tenantId: 'existing-tenant'
            });
            expect(tenantsService.create).not.toHaveBeenCalled();
        });
        it('should return user info in response', async ()=>{
            prisma.tenant.findFirst.mockResolvedValue(null);
            const result = await service.register({
                email: 'user@example.com',
                password: 'password123',
                name: 'User'
            });
            expect(result.user.email).toBe('user@example.com');
            expect(result.user.name).toBe('User');
        });
    });
    describe('login', ()=>{
        it('should throw UnauthorizedException if tenant not found', async ()=>{
            prisma.tenant.findFirst.mockResolvedValue(null);
            await expect(service.login({
                email: 'bad@example.com',
                password: 'pass'
            })).rejects.toThrow(_common.UnauthorizedException);
        });
        it('should return token on valid login', async ()=>{
            prisma.tenant.findFirst.mockResolvedValue({
                id: 'tenant-1',
                name: 'Test'
            });
            const result = await service.login({
                email: 'api-key-here',
                password: 'pass'
            });
            expect(result.token).toBe('jwt-token');
        });
        it('should sign JWT with tenantId', async ()=>{
            prisma.tenant.findFirst.mockResolvedValue({
                id: 'tenant-1',
                name: 'Test'
            });
            await service.login({
                email: 'key',
                password: 'pass'
            });
            expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({
                tenantId: 'tenant-1'
            }));
        });
    });
});

//# sourceMappingURL=auth.service.spec.js.map