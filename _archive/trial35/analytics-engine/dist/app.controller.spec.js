"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _appcontroller = require("./app.controller");
const _appservice = require("./app.service");
describe('AppController', ()=>{
    let controller;
    let service;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _appcontroller.AppController
            ],
            providers: [
                _appservice.AppService
            ]
        }).compile();
        controller = module.get(_appcontroller.AppController);
        service = module.get(_appservice.AppService);
    });
    it('should be defined', ()=>{
        expect(controller).toBeDefined();
    });
    it('should return health status', ()=>{
        const result = controller.getHealth();
        expect(result).toHaveProperty('status', 'ok');
        expect(result).toHaveProperty('timestamp');
    });
});

//# sourceMappingURL=app.controller.spec.js.map