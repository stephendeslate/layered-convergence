"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _syncruncontroller = require("./sync-run.controller");
const mockService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    updateStatus: vi.fn(),
    getHistory: vi.fn(),
    remove: vi.fn()
};
describe('SyncRunController', ()=>{
    let controller;
    beforeEach(()=>{
        controller = new _syncruncontroller.SyncRunController(mockService);
        vi.clearAllMocks();
    });
    it('should call create', async ()=>{
        mockService.create.mockResolvedValue({
            id: '1',
            status: 'pending'
        });
        const result = await controller.create({
            dataSourceId: 'ds1'
        });
        expect(result.status).toBe('pending');
    });
    it('should call findAll without filter', async ()=>{
        mockService.findAll.mockResolvedValue([]);
        await controller.findAll();
        expect(mockService.findAll).toHaveBeenCalledWith(undefined);
    });
    it('should call findAll with dataSourceId', async ()=>{
        mockService.findAll.mockResolvedValue([]);
        await controller.findAll('ds1');
        expect(mockService.findAll).toHaveBeenCalledWith('ds1');
    });
    it('should call findOne', async ()=>{
        mockService.findOne.mockResolvedValue({
            id: '1'
        });
        const result = await controller.findOne('1');
        expect(result.id).toBe('1');
    });
    it('should call updateStatus', async ()=>{
        mockService.updateStatus.mockResolvedValue({
            id: '1',
            status: 'running'
        });
        const result = await controller.updateStatus('1', {
            status: 'running'
        });
        expect(result.status).toBe('running');
    });
    it('should call getHistory with default limit', async ()=>{
        mockService.getHistory.mockResolvedValue([]);
        await controller.getHistory('ds1');
        expect(mockService.getHistory).toHaveBeenCalledWith('ds1', undefined);
    });
    it('should call getHistory with custom limit', async ()=>{
        mockService.getHistory.mockResolvedValue([]);
        await controller.getHistory('ds1', '5');
        expect(mockService.getHistory).toHaveBeenCalledWith('ds1', 5);
    });
    it('should call remove', async ()=>{
        mockService.remove.mockResolvedValue({
            id: '1'
        });
        await controller.remove('1');
        expect(mockService.remove).toHaveBeenCalledWith('1');
    });
});

//# sourceMappingURL=sync-run.controller.spec.js.map