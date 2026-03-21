"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _appservice = require("./app.service");
describe('AppService', ()=>{
    let service;
    beforeEach(()=>{
        service = new _appservice.AppService();
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
    it('should return health with status ok', ()=>{
        const result = service.getHealth();
        expect(result.status).toBe('ok');
    });
    it('should return health with ISO timestamp', ()=>{
        const result = service.getHealth();
        expect(()=>new Date(result.timestamp)).not.toThrow();
    });
});

//# sourceMappingURL=app.service.spec.js.map