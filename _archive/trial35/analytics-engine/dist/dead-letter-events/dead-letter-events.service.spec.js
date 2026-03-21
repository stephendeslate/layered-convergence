"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _common = require("@nestjs/common");
const _deadlettereventsservice = require("./dead-letter-events.service");
const _prismaservice = require("../prisma/prisma.service");
describe('DeadLetterEventsService', ()=>{
    let service;
    let prisma;
    const mockEvent = {
        id: 'dle-1',
        dataSourceId: 'ds-1',
        payload: {
            event: 'page_view'
        },
        errorReason: 'Invalid schema',
        createdAt: new Date(),
        retriedAt: null
    };
    beforeEach(async ()=>{
        prisma = {
            deadLetterEvent: {
                create: vi.fn().mockResolvedValue(mockEvent),
                findMany: vi.fn().mockResolvedValue([
                    mockEvent
                ]),
                findUnique: vi.fn(),
                update: vi.fn(),
                delete: vi.fn().mockResolvedValue(mockEvent)
            }
        };
        const module = await _testing.Test.createTestingModule({
            providers: [
                _deadlettereventsservice.DeadLetterEventsService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: prisma
                }
            ]
        }).compile();
        service = module.get(_deadlettereventsservice.DeadLetterEventsService);
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
    describe('create', ()=>{
        it('should create a dead letter event', async ()=>{
            const result = await service.create({
                dataSourceId: 'ds-1',
                payload: {
                    event: 'page_view'
                },
                errorReason: 'Invalid schema'
            });
            expect(result).toEqual(mockEvent);
        });
    });
    describe('findByDataSource', ()=>{
        it('should return events for a data source', async ()=>{
            const result = await service.findByDataSource('ds-1');
            expect(result).toHaveLength(1);
        });
    });
    describe('findById', ()=>{
        it('should return event when found', async ()=>{
            prisma.deadLetterEvent.findUnique.mockResolvedValue(mockEvent);
            const result = await service.findById('dle-1');
            expect(result.id).toBe('dle-1');
        });
        it('should throw NotFoundException when not found', async ()=>{
            prisma.deadLetterEvent.findUnique.mockResolvedValue(null);
            await expect(service.findById('bad-id')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('retry', ()=>{
        it('should set retriedAt timestamp', async ()=>{
            prisma.deadLetterEvent.update.mockResolvedValue({
                ...mockEvent,
                retriedAt: new Date()
            });
            const result = await service.retry('dle-1');
            expect(result.retriedAt).not.toBeNull();
        });
    });
    describe('remove', ()=>{
        it('should delete event', async ()=>{
            await service.remove('dle-1');
            expect(prisma.deadLetterEvent.delete).toHaveBeenCalledWith({
                where: {
                    id: 'dle-1'
                }
            });
        });
    });
});

//# sourceMappingURL=dead-letter-events.service.spec.js.map