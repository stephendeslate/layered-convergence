"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _transitions = require("./transitions");
describe('VALID_TRANSITIONS (SyncRun)', ()=>{
    it('should allow pending -> running', ()=>{
        expect(_transitions.VALID_TRANSITIONS['pending']).toContain('running');
    });
    it('should allow running -> completed', ()=>{
        expect(_transitions.VALID_TRANSITIONS['running']).toContain('completed');
    });
    it('should allow running -> failed', ()=>{
        expect(_transitions.VALID_TRANSITIONS['running']).toContain('failed');
    });
    it('should allow failed -> pending', ()=>{
        expect(_transitions.VALID_TRANSITIONS['failed']).toContain('pending');
    });
    it('should not allow completed to transition', ()=>{
        expect(_transitions.VALID_TRANSITIONS['completed']).toHaveLength(0);
    });
    it('should not allow pending -> completed', ()=>{
        expect(_transitions.VALID_TRANSITIONS['pending']).not.toContain('completed');
    });
    it('should not allow pending -> failed', ()=>{
        expect(_transitions.VALID_TRANSITIONS['pending']).not.toContain('failed');
    });
});
describe('DATA_SOURCE_TRANSITIONS', ()=>{
    it('should allow active -> paused', ()=>{
        expect(_transitions.DATA_SOURCE_TRANSITIONS['active']).toContain('paused');
    });
    it('should allow active -> archived', ()=>{
        expect(_transitions.DATA_SOURCE_TRANSITIONS['active']).toContain('archived');
    });
    it('should allow paused -> active', ()=>{
        expect(_transitions.DATA_SOURCE_TRANSITIONS['paused']).toContain('active');
    });
    it('should allow paused -> archived', ()=>{
        expect(_transitions.DATA_SOURCE_TRANSITIONS['paused']).toContain('archived');
    });
    it('should not allow archived to transition', ()=>{
        expect(_transitions.DATA_SOURCE_TRANSITIONS['archived']).toHaveLength(0);
    });
});

//# sourceMappingURL=transitions.spec.js.map