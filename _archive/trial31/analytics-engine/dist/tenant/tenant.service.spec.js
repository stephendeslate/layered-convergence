"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _tenantservice = require("./tenant.service");
const mockPrisma = {
    tenant: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
};
describe('TenantService', ()=>{
    let service;
    beforeEach(()=>{
        service = new _tenantservice.TenantService(mockPrisma);
        vi.clearAllMocks();
    });
    describe('create', ()=>{
        it('should create a tenant with a generated apiKey', async ()=>{
            const dto = {
                name: 'Acme Corp'
            };
            mockPrisma.tenant.create.mockResolvedValue({
                id: '1',
                ...dto,
                apiKey: 'generated'
            });
            const result = await service.create(dto);
            expect(mockPrisma.tenant.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'Acme Corp',
                    apiKey: expect.any(String)
                })
            });
            expect(result).toBeDefined();
        });
        it('should generate a uuid for the apiKey', async ()=>{
            const dto = {
                name: 'Test'
            };
            mockPrisma.tenant.create.mockResolvedValue({
                id: '1',
                name: 'Test',
                apiKey: 'uuid'
            });
            await service.create(dto);
            const call = mockPrisma.tenant.create.mock.calls[0][0];
            expect(call.data.apiKey).toBeDefined();
            expect(typeof call.data.apiKey).toBe('string');
        });
    });
    describe('findAll', ()=>{
        it('should return all tenants', async ()=>{
            const tenants = [
                {
                    id: '1',
                    name: 'T1'
                },
                {
                    id: '2',
                    name: 'T2'
                }
            ];
            mockPrisma.tenant.findMany.mockResolvedValue(tenants);
            const result = await service.findAll();
            expect(result).toEqual(tenants);
            expect(mockPrisma.tenant.findMany).toHaveBeenCalled();
        });
    });
    describe('findOne', ()=>{
        it('should return a tenant by id', async ()=>{
            const tenant = {
                id: '1',
                name: 'T1'
            };
            mockPrisma.tenant.findUniqueOrThrow.mockResolvedValue(tenant);
            const result = await service.findOne('1');
            expect(result).toEqual(tenant);
            expect(mockPrisma.tenant.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                    id: '1'
                }
            });
        });
        it('should throw if tenant not found', async ()=>{
            mockPrisma.tenant.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));
            await expect(service.findOne('nonexistent')).rejects.toThrow('Not found');
        });
    });
    describe('findByApiKey', ()=>{
        it('should find tenant by api key', async ()=>{
            const tenant = {
                id: '1',
                apiKey: 'key-1'
            };
            mockPrisma.tenant.findUnique.mockResolvedValue(tenant);
            const result = await service.findByApiKey('key-1');
            expect(result).toEqual(tenant);
            expect(mockPrisma.tenant.findUnique).toHaveBeenCalledWith({
                where: {
                    apiKey: 'key-1'
                }
            });
        });
        it('should return null if no tenant found', async ()=>{
            mockPrisma.tenant.findUnique.mockResolvedValue(null);
            const result = await service.findByApiKey('invalid');
            expect(result).toBeNull();
        });
    });
    describe('update', ()=>{
        it('should update a tenant', async ()=>{
            const updated = {
                id: '1',
                name: 'Updated'
            };
            mockPrisma.tenant.update.mockResolvedValue(updated);
            const result = await service.update('1', {
                name: 'Updated'
            });
            expect(result).toEqual(updated);
            expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
                where: {
                    id: '1'
                },
                data: {
                    name: 'Updated'
                }
            });
        });
    });
    describe('remove', ()=>{
        it('should delete a tenant', async ()=>{
            mockPrisma.tenant.delete.mockResolvedValue({
                id: '1'
            });
            const result = await service.remove('1');
            expect(result).toEqual({
                id: '1'
            });
            expect(mockPrisma.tenant.delete).toHaveBeenCalledWith({
                where: {
                    id: '1'
                }
            });
        });
    });
    describe('regenerateApiKey', ()=>{
        it('should update the tenant with a new apiKey', async ()=>{
            mockPrisma.tenant.update.mockResolvedValue({
                id: '1',
                apiKey: 'new-key'
            });
            const result = await service.regenerateApiKey('1');
            expect(result.apiKey).toBeDefined();
            expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
                where: {
                    id: '1'
                },
                data: {
                    apiKey: expect.any(String)
                }
            });
        });
    });
});

//# sourceMappingURL=tenant.service.spec.js.map