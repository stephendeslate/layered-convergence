"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _common = require("@nestjs/common");
const _workorderstatemachine = require("./work-order-state-machine");
(0, _vitest.describe)('WorkOrderStateMachine', ()=>{
    (0, _vitest.describe)('VALID_TRANSITIONS', ()=>{
        (0, _vitest.it)('should define transitions for all WorkOrderStatus values', ()=>{
            const statuses = [
                'UNASSIGNED',
                'ASSIGNED',
                'EN_ROUTE',
                'ON_SITE',
                'IN_PROGRESS',
                'COMPLETED',
                'INVOICED',
                'PAID'
            ];
            for (const status of statuses){
                (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS[status]).toBeDefined();
            }
        });
        (0, _vitest.it)('should allow UNASSIGNED -> ASSIGNED', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS['UNASSIGNED']).toContain('ASSIGNED');
        });
        (0, _vitest.it)('should allow ASSIGNED -> EN_ROUTE', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS['ASSIGNED']).toContain('EN_ROUTE');
        });
        (0, _vitest.it)('should allow ASSIGNED -> UNASSIGNED (backward)', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS['ASSIGNED']).toContain('UNASSIGNED');
        });
        (0, _vitest.it)('should allow EN_ROUTE -> ON_SITE', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS['EN_ROUTE']).toContain('ON_SITE');
        });
        (0, _vitest.it)('should allow EN_ROUTE -> ASSIGNED (backward)', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS['EN_ROUTE']).toContain('ASSIGNED');
        });
        (0, _vitest.it)('should allow ON_SITE -> IN_PROGRESS', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS['ON_SITE']).toContain('IN_PROGRESS');
        });
        (0, _vitest.it)('should allow ON_SITE -> EN_ROUTE (backward)', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS['ON_SITE']).toContain('EN_ROUTE');
        });
        (0, _vitest.it)('should allow IN_PROGRESS -> COMPLETED', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS['IN_PROGRESS']).toContain('COMPLETED');
        });
        (0, _vitest.it)('should allow IN_PROGRESS -> ON_SITE (backward)', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS['IN_PROGRESS']).toContain('ON_SITE');
        });
        (0, _vitest.it)('should allow COMPLETED -> INVOICED', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS['COMPLETED']).toContain('INVOICED');
        });
        (0, _vitest.it)('should allow INVOICED -> PAID', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS['INVOICED']).toContain('PAID');
        });
        (0, _vitest.it)('should not allow transitions from PAID', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS['PAID']).toEqual([]);
        });
    });
    (0, _vitest.describe)('validateTransition', ()=>{
        (0, _vitest.it)('should not throw for valid forward transition', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)('UNASSIGNED', 'ASSIGNED')).not.toThrow();
        });
        (0, _vitest.it)('should not throw for valid backward transition', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)('ASSIGNED', 'UNASSIGNED')).not.toThrow();
        });
        (0, _vitest.it)('should throw BadRequestException for invalid transition', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)('UNASSIGNED', 'COMPLETED')).toThrow(_common.BadRequestException);
        });
        (0, _vitest.it)('should throw for skipping states', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)('UNASSIGNED', 'EN_ROUTE')).toThrow(_common.BadRequestException);
        });
        (0, _vitest.it)('should throw for PAID -> any transition', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)('PAID', 'UNASSIGNED')).toThrow(_common.BadRequestException);
        });
        (0, _vitest.it)('should include from and to status in error message', ()=>{
            try {
                (0, _workorderstatemachine.validateTransition)('UNASSIGNED', 'COMPLETED');
            } catch (e) {
                (0, _vitest.expect)(e.message).toContain('UNASSIGNED');
                (0, _vitest.expect)(e.message).toContain('COMPLETED');
            }
        });
    });
});

//# sourceMappingURL=work-order-state-machine.spec.js.map