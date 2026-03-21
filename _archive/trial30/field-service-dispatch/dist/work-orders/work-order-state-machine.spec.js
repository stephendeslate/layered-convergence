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
        (0, _vitest.it)('should define transitions for all 8 statuses', ()=>{
            const statuses = Object.values(_client.WorkOrderStatus);
            (0, _vitest.expect)(statuses).toHaveLength(8);
            for (const status of statuses){
                (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS).toHaveProperty(status);
            }
        });
        (0, _vitest.it)('should allow UNASSIGNED -> ASSIGNED', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS[_client.WorkOrderStatus.UNASSIGNED]).toContain(_client.WorkOrderStatus.ASSIGNED);
        });
        (0, _vitest.it)('should allow ASSIGNED -> EN_ROUTE', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS[_client.WorkOrderStatus.ASSIGNED]).toContain(_client.WorkOrderStatus.EN_ROUTE);
        });
        (0, _vitest.it)('should allow ASSIGNED -> UNASSIGNED', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS[_client.WorkOrderStatus.ASSIGNED]).toContain(_client.WorkOrderStatus.UNASSIGNED);
        });
        (0, _vitest.it)('should allow EN_ROUTE -> ON_SITE', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS[_client.WorkOrderStatus.EN_ROUTE]).toContain(_client.WorkOrderStatus.ON_SITE);
        });
        (0, _vitest.it)('should allow ON_SITE -> IN_PROGRESS', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS[_client.WorkOrderStatus.ON_SITE]).toContain(_client.WorkOrderStatus.IN_PROGRESS);
        });
        (0, _vitest.it)('should allow IN_PROGRESS -> COMPLETED', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS[_client.WorkOrderStatus.IN_PROGRESS]).toContain(_client.WorkOrderStatus.COMPLETED);
        });
        (0, _vitest.it)('should allow COMPLETED -> INVOICED', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS[_client.WorkOrderStatus.COMPLETED]).toContain(_client.WorkOrderStatus.INVOICED);
        });
        (0, _vitest.it)('should allow INVOICED -> PAID', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS[_client.WorkOrderStatus.INVOICED]).toContain(_client.WorkOrderStatus.PAID);
        });
        (0, _vitest.it)('should have no transitions from PAID', ()=>{
            (0, _vitest.expect)(_workorderstatemachine.VALID_TRANSITIONS[_client.WorkOrderStatus.PAID]).toEqual([]);
        });
    });
    (0, _vitest.describe)('validateTransition', ()=>{
        (0, _vitest.it)('should not throw for valid transition UNASSIGNED -> ASSIGNED', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)(_client.WorkOrderStatus.UNASSIGNED, _client.WorkOrderStatus.ASSIGNED)).not.toThrow();
        });
        (0, _vitest.it)('should throw BadRequestException for invalid transition', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)(_client.WorkOrderStatus.UNASSIGNED, _client.WorkOrderStatus.COMPLETED)).toThrow(_common.BadRequestException);
        });
        (0, _vitest.it)('should throw with descriptive message for invalid transition', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)(_client.WorkOrderStatus.PAID, _client.WorkOrderStatus.UNASSIGNED)).toThrow('Invalid status transition from PAID to UNASSIGNED');
        });
        (0, _vitest.it)('should throw for skipping states', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)(_client.WorkOrderStatus.UNASSIGNED, _client.WorkOrderStatus.ON_SITE)).toThrow(_common.BadRequestException);
        });
        (0, _vitest.it)('should allow backward transitions where defined', ()=>{
            (0, _vitest.expect)(()=>(0, _workorderstatemachine.validateTransition)(_client.WorkOrderStatus.EN_ROUTE, _client.WorkOrderStatus.ASSIGNED)).not.toThrow();
        });
    });
});

//# sourceMappingURL=work-order-state-machine.spec.js.map