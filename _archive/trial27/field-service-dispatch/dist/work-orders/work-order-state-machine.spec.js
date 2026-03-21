"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _workorderstatemachine = require("./work-order-state-machine");
(0, _vitest.describe)('WorkOrderStateMachine', ()=>{
    (0, _vitest.describe)('VALID_TRANSITIONS', ()=>{
        (0, _vitest.it)('should define all 8 statuses', ()=>{
            const statuses = Object.keys(_workorderstatemachine.VALID_TRANSITIONS);
            (0, _vitest.expect)(statuses).toHaveLength(8);
        });
        (0, _vitest.it)('should allow UNASSIGNED -> ASSIGNED', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS.UNASSIGNED).toContain('ASSIGNED');
        });
        (0, _vitest.it)('should allow ASSIGNED -> EN_ROUTE', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS.ASSIGNED).toContain('EN_ROUTE');
        });
        (0, _vitest.it)('should allow ASSIGNED -> UNASSIGNED (backward)', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS.ASSIGNED).toContain('UNASSIGNED');
        });
        (0, _vitest.it)('should allow EN_ROUTE -> ON_SITE', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS.EN_ROUTE).toContain('ON_SITE');
        });
        (0, _vitest.it)('should allow ON_SITE -> IN_PROGRESS', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS.ON_SITE).toContain('IN_PROGRESS');
        });
        (0, _vitest.it)('should allow IN_PROGRESS -> COMPLETED', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS.IN_PROGRESS).toContain('COMPLETED');
        });
        (0, _vitest.it)('should allow COMPLETED -> INVOICED', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS.COMPLETED).toContain('INVOICED');
        });
        (0, _vitest.it)('should allow INVOICED -> PAID', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS.INVOICED).toContain('PAID');
        });
        (0, _vitest.it)('should not allow PAID -> anything (terminal)', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS.PAID).toHaveLength(0);
        });
        (0, _vitest.it)('should not allow UNASSIGNED -> COMPLETED', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS.UNASSIGNED).not.toContain('COMPLETED');
        });
        (0, _vitest.it)('should not allow COMPLETED -> ASSIGNED', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS.COMPLETED).not.toContain('ASSIGNED');
        });
    });
    (0, _vitest.describe)('validateTransition', ()=>{
        (0, _vitest.it)('should not throw for valid transition', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)(_client.WorkOrderStatus.UNASSIGNED, _client.WorkOrderStatus.ASSIGNED)).not.toThrow();
        });
        (0, _vitest.it)('should throw BadRequestException for invalid transition', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)(_client.WorkOrderStatus.UNASSIGNED, _client.WorkOrderStatus.COMPLETED)).toThrow(_common.BadRequestException);
        });
        (0, _vitest.it)('should include from/to in error message', ()=>{
            try {
                (0, _workorderstatemachine.validateTransition)(_client.WorkOrderStatus.PAID, _client.WorkOrderStatus.ASSIGNED);
            } catch (e) {
                (0, _vitest.expect)(e.message).toContain('PAID');
                (0, _vitest.expect)(e.message).toContain('ASSIGNED');
            }
        });
        (0, _vitest.it)('should throw for PAID -> COMPLETED', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)(_client.WorkOrderStatus.PAID, _client.WorkOrderStatus.COMPLETED)).toThrow(_common.BadRequestException);
        });
        (0, _vitest.it)('should allow backward transition EN_ROUTE -> ASSIGNED', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)(_client.WorkOrderStatus.EN_ROUTE, _client.WorkOrderStatus.ASSIGNED)).not.toThrow();
        });
    });
});

//# sourceMappingURL=work-order-state-machine.spec.js.map