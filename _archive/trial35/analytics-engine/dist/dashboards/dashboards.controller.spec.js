"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _dashboardscontroller = require("./dashboards.controller");
const _dashboardsservice = require("./dashboards.service");
describe('DashboardsController', ()=>{
    let controller;
    let service;
    beforeEach(async ()=>{
        service = {
            create: vi.fn().mockResolvedValue({
                id: 'dash-1'
            }),
            findAll: vi.fn().mockResolvedValue([]),
            findById: vi.fn().mockResolvedValue({
                id: 'dash-1'
            }),
            update: vi.fn().mockResolvedValue({
                id: 'dash-1'
            }),
            remove: vi.fn().mockResolvedValue({
                id: 'dash-1'
            })
        };
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _dashboardscontroller.DashboardsController
            ],
            providers: [
                {
                    provide: _dashboardsservice.DashboardsService,
                    useValue: service
                }
            ]
        }).compile();
        controller = module.get(_dashboardscontroller.DashboardsController);
    });
    it('should be defined', ()=>{
        expect(controller).toBeDefined();
    });
    it('should create dashboard', async ()=>{
        await controller.create({
            tenantId: 't1',
            name: 'D1'
        });
        expect(service.create).toHaveBeenCalled();
    });
    it('should find all by tenantId', async ()=>{
        await controller.findAll('t1');
        expect(service.findAll).toHaveBeenCalledWith('t1');
    });
    it('should find by id', async ()=>{
        await controller.findById('dash-1');
        expect(service.findById).toHaveBeenCalledWith('dash-1');
    });
    it('should update', async ()=>{
        await controller.update('dash-1', {
            name: 'New'
        });
        expect(service.update).toHaveBeenCalledWith('dash-1', {
            name: 'New'
        });
    });
    it('should remove', async ()=>{
        await controller.remove('dash-1');
        expect(service.remove).toHaveBeenCalledWith('dash-1');
    });
});

//# sourceMappingURL=dashboards.controller.spec.js.map