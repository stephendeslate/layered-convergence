"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _common = require("@nestjs/common");
const _authservice = require("./auth.service");
const mockPrisma = {
    tenant: {
        findUnique: vi.fn()
    }
};
describe('AuthService', ()=>{
    let service;
    beforeEach(()=>{
        service = new _authservice.AuthService(mockPrisma);
        vi.clearAllMocks();
    });
    describe('validateApiKey', ()=>{
        it('should return tenant for valid api key', async ()=>{
            const tenant = {
                id: 't1',
                apiKey: 'valid-key'
            };
            mockPrisma.tenant.findUnique.mockResolvedValue(tenant);
            const result = await service.validateApiKey('valid-key');
            expect(result).toEqual(tenant);
        });
        it('should throw UnauthorizedException for empty api key', async ()=>{
            await expect(service.validateApiKey('')).rejects.toThrow(_common.UnauthorizedException);
        });
        it('should throw UnauthorizedException for null api key', async ()=>{
            await expect(service.validateApiKey(null)).rejects.toThrow(_common.UnauthorizedException);
        });
        it('should throw UnauthorizedException for invalid api key', async ()=>{
            mockPrisma.tenant.findUnique.mockResolvedValue(null);
            await expect(service.validateApiKey('invalid')).rejects.toThrow(_common.UnauthorizedException);
        });
    });
    describe('validateTenantAccess', ()=>{
        it('should return true when tenant matches', async ()=>{
            mockPrisma.tenant.findUnique.mockResolvedValue({
                id: 't1',
                apiKey: 'key'
            });
            const result = await service.validateTenantAccess('key', 't1');
            expect(result).toBe(true);
        });
        it('should return false when tenant does not match', async ()=>{
            mockPrisma.tenant.findUnique.mockResolvedValue({
                id: 't1',
                apiKey: 'key'
            });
            const result = await service.validateTenantAccess('key', 't2');
            expect(result).toBe(false);
        });
    });
});

//# sourceMappingURL=auth.service.spec.js.map