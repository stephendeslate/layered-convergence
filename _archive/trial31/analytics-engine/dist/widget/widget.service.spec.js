"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _widgetservice = require("./widget.service");
const mockPrisma = {
    widget: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
};
describe('WidgetService', ()=>{
    let service;
    beforeEach(()=>{
        service = new _widgetservice.WidgetService(mockPrisma);
        vi.clearAllMocks();
    });
    it('should create a widget', async ()=>{
        const dto = {
            dashboardId: 'd1',
            type: 'chart',
            config: {}
        };
        mockPrisma.widget.create.mockResolvedValue({
            id: '1',
            ...dto
        });
        const result = await service.create(dto);
        expect(result.type).toBe('chart');
        expect(mockPrisma.widget.create).toHaveBeenCalledWith({
            data: dto
        });
    });
    it('should find all widgets', async ()=>{
        mockPrisma.widget.findMany.mockResolvedValue([]);
        const result = await service.findAll();
        expect(result).toEqual([]);
    });
    it('should filter widgets by dashboardId', async ()=>{
        mockPrisma.widget.findMany.mockResolvedValue([]);
        await service.findAll('d1');
        expect(mockPrisma.widget.findMany).toHaveBeenCalledWith({
            where: {
                dashboardId: 'd1'
            }
        });
    });
    it('should find one widget', async ()=>{
        mockPrisma.widget.findUniqueOrThrow.mockResolvedValue({
            id: '1'
        });
        const result = await service.findOne('1');
        expect(result.id).toBe('1');
    });
    it('should update a widget', async ()=>{
        mockPrisma.widget.update.mockResolvedValue({
            id: '1',
            type: 'table'
        });
        const result = await service.update('1', {
            type: 'table'
        });
        expect(result.type).toBe('table');
    });
    it('should remove a widget', async ()=>{
        mockPrisma.widget.delete.mockResolvedValue({
            id: '1'
        });
        const result = await service.remove('1');
        expect(result.id).toBe('1');
    });
});

//# sourceMappingURL=widget.service.spec.js.map