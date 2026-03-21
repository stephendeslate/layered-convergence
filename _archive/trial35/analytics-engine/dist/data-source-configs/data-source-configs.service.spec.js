"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _datasourceconfigsservice = require("./data-source-configs.service");
const _prismaservice = require("../prisma/prisma.service");
describe('DataSourceConfigsService', ()=>{
    let service;
    let prisma;
    const mockConfig = {
        id: 'config-1',
        dataSourceId: 'ds-1',
        connectionConfig: {
            url: 'http://api.example.com'
        },
        fieldMapping: {
            name: 'userName'
        },
        transformSteps: null,
        syncSchedule: '0 * * * *'
    };
    beforeEach(async ()=>{
        prisma = {
            dataSourceConfig: {
                create: vi.fn().mockResolvedValue(mockConfig),
                findUnique: vi.fn(),
                update: vi.fn().mockResolvedValue(mockConfig),
                delete: vi.fn().mockResolvedValue(mockConfig)
            }
        };
        const module = await _testing.Test.createTestingModule({
            providers: [
                _datasourceconfigsservice.DataSourceConfigsService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: prisma
                }
            ]
        }).compile();
        service = module.get(_datasourceconfigsservice.DataSourceConfigsService);
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
    describe('create', ()=>{
        it('should create a config', async ()=>{
            const result = await service.create({
                dataSourceId: 'ds-1',
                connectionConfig: {
                    url: 'http://api.example.com'
                },
                fieldMapping: {
                    name: 'userName'
                }
            });
            expect(result).toEqual(mockConfig);
        });
    });
    describe('findByDataSource', ()=>{
        it('should return config when found', async ()=>{
            prisma.dataSourceConfig.findUnique.mockResolvedValue(mockConfig);
            const result = await service.findByDataSource('ds-1');
            expect(result.dataSourceId).toBe('ds-1');
        });
        it('should throw NotFoundException when not found', async ()=>{
            prisma.dataSourceConfig.findUnique.mockResolvedValue(null);
            await expect(service.findByDataSource('bad-id')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('update', ()=>{
        it('should update config fields', async ()=>{
            await service.update('ds-1', {
                syncSchedule: '0 */2 * * *'
            });
            expect(prisma.dataSourceConfig.update).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    dataSourceId: 'ds-1'
                }
            }));
        });
    });
    describe('remove', ()=>{
        it('should delete config', async ()=>{
            await service.remove('ds-1');
            expect(prisma.dataSourceConfig.delete).toHaveBeenCalledWith({
                where: {
                    dataSourceId: 'ds-1'
                }
            });
        });
    });
});

//# sourceMappingURL=data-source-configs.service.spec.js.map