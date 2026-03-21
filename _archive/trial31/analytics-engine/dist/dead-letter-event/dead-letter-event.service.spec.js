"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _deadlettereventservice = require("./dead-letter-event.service");
const mockPrisma = {
    deadLetterEvent: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
};
describe('DeadLetterEventService', ()=>{
    let service;
    beforeEach(()=>{
        service = new _deadlettereventservice.DeadLetterEventService(mockPrisma);
        vi.clearAllMocks();
    });
    it('should create a dead letter event', async ()=>{
        const dto = {
            dataSourceId: 'ds1',
            payload: {
                foo: 'bar'
            },
            errorReason: 'parse error'
        };
        mockPrisma.deadLetterEvent.create.mockResolvedValue({
            id: '1',
            ...dto
        });
        const result = await service.create(dto);
        expect(result.errorReason).toBe('parse error');
    });
    it('should find all dead letter events', async ()=>{
        mockPrisma.deadLetterEvent.findMany.mockResolvedValue([]);
        const result = await service.findAll();
        expect(result).toEqual([]);
    });
    it('should filter by dataSourceId', async ()=>{
        mockPrisma.deadLetterEvent.findMany.mockResolvedValue([]);
        await service.findAll('ds1');
        expect(mockPrisma.deadLetterEvent.findMany).toHaveBeenCalledWith({
            where: {
                dataSourceId: 'ds1'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    });
    it('should find one dead letter event', async ()=>{
        mockPrisma.deadLetterEvent.findUniqueOrThrow.mockResolvedValue({
            id: '1'
        });
        const result = await service.findOne('1');
        expect(result.id).toBe('1');
    });
    it('should mark as retried', async ()=>{
        mockPrisma.deadLetterEvent.update.mockResolvedValue({
            id: '1',
            retriedAt: new Date()
        });
        const result = await service.markRetried('1');
        expect(result.retriedAt).toBeDefined();
        expect(mockPrisma.deadLetterEvent.update).toHaveBeenCalledWith({
            where: {
                id: '1'
            },
            data: {
                retriedAt: expect.any(Date)
            }
        });
    });
    it('should remove a dead letter event', async ()=>{
        mockPrisma.deadLetterEvent.delete.mockResolvedValue({
            id: '1'
        });
        await service.remove('1');
        expect(mockPrisma.deadLetterEvent.delete).toHaveBeenCalledWith({
            where: {
                id: '1'
            }
        });
    });
});

//# sourceMappingURL=dead-letter-event.service.spec.js.map