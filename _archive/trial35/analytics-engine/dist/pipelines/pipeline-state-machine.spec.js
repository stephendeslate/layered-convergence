"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _common = require("@nestjs/common");
const _pipelinestatemachine = require("./pipeline-state-machine");
describe('Pipeline State Machine', ()=>{
    describe('VALID_TRANSITIONS', ()=>{
        it('should allow DRAFT -> ACTIVE', ()=>{
            expect(_pipelinestatemachine.VALID_TRANSITIONS.DRAFT).toContain('ACTIVE');
        });
        it('should allow ACTIVE -> PAUSED', ()=>{
            expect(_pipelinestatemachine.VALID_TRANSITIONS.ACTIVE).toContain('PAUSED');
        });
        it('should allow ACTIVE -> ARCHIVED', ()=>{
            expect(_pipelinestatemachine.VALID_TRANSITIONS.ACTIVE).toContain('ARCHIVED');
        });
        it('should allow PAUSED -> ACTIVE', ()=>{
            expect(_pipelinestatemachine.VALID_TRANSITIONS.PAUSED).toContain('ACTIVE');
        });
        it('should allow PAUSED -> ARCHIVED', ()=>{
            expect(_pipelinestatemachine.VALID_TRANSITIONS.PAUSED).toContain('ARCHIVED');
        });
        it('should not allow any transitions from ARCHIVED', ()=>{
            expect(_pipelinestatemachine.VALID_TRANSITIONS.ARCHIVED).toHaveLength(0);
        });
        it('should not allow DRAFT -> PAUSED', ()=>{
            expect(_pipelinestatemachine.VALID_TRANSITIONS.DRAFT).not.toContain('PAUSED');
        });
        it('should not allow DRAFT -> ARCHIVED', ()=>{
            expect(_pipelinestatemachine.VALID_TRANSITIONS.DRAFT).not.toContain('ARCHIVED');
        });
    });
    describe('validatePipelineTransition', ()=>{
        it('should not throw for DRAFT -> ACTIVE', ()=>{
            expect(()=>(0, _pipelinestatemachine.validatePipelineTransition)('DRAFT', 'ACTIVE')).not.toThrow();
        });
        it('should not throw for ACTIVE -> PAUSED', ()=>{
            expect(()=>(0, _pipelinestatemachine.validatePipelineTransition)('ACTIVE', 'PAUSED')).not.toThrow();
        });
        it('should not throw for ACTIVE -> ARCHIVED', ()=>{
            expect(()=>(0, _pipelinestatemachine.validatePipelineTransition)('ACTIVE', 'ARCHIVED')).not.toThrow();
        });
        it('should not throw for PAUSED -> ACTIVE', ()=>{
            expect(()=>(0, _pipelinestatemachine.validatePipelineTransition)('PAUSED', 'ACTIVE')).not.toThrow();
        });
        it('should not throw for PAUSED -> ARCHIVED', ()=>{
            expect(()=>(0, _pipelinestatemachine.validatePipelineTransition)('PAUSED', 'ARCHIVED')).not.toThrow();
        });
        it('should throw BadRequestException for DRAFT -> PAUSED', ()=>{
            expect(()=>(0, _pipelinestatemachine.validatePipelineTransition)('DRAFT', 'PAUSED')).toThrow(_common.BadRequestException);
        });
        it('should throw BadRequestException for DRAFT -> ARCHIVED', ()=>{
            expect(()=>(0, _pipelinestatemachine.validatePipelineTransition)('DRAFT', 'ARCHIVED')).toThrow(_common.BadRequestException);
        });
        it('should throw BadRequestException for ARCHIVED -> ACTIVE', ()=>{
            expect(()=>(0, _pipelinestatemachine.validatePipelineTransition)('ARCHIVED', 'ACTIVE')).toThrow(_common.BadRequestException);
        });
        it('should throw BadRequestException for ARCHIVED -> DRAFT', ()=>{
            expect(()=>(0, _pipelinestatemachine.validatePipelineTransition)('ARCHIVED', 'DRAFT')).toThrow(_common.BadRequestException);
        });
        it('should include from and to in error message', ()=>{
            try {
                (0, _pipelinestatemachine.validatePipelineTransition)('ARCHIVED', 'ACTIVE');
                expect.unreachable('Should have thrown');
            } catch (error) {
                expect(error.message).toContain('ARCHIVED');
                expect(error.message).toContain('ACTIVE');
            }
        });
    });
});

//# sourceMappingURL=pipeline-state-machine.spec.js.map