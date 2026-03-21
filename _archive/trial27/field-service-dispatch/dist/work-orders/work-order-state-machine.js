"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get VALID_TRANSITIONS () {
        return VALID_TRANSITIONS;
    },
    get validateTransition () {
        return validateTransition;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const VALID_TRANSITIONS = {
    [_client.WorkOrderStatus.UNASSIGNED]: [
        _client.WorkOrderStatus.ASSIGNED
    ],
    [_client.WorkOrderStatus.ASSIGNED]: [
        _client.WorkOrderStatus.EN_ROUTE,
        _client.WorkOrderStatus.UNASSIGNED
    ],
    [_client.WorkOrderStatus.EN_ROUTE]: [
        _client.WorkOrderStatus.ON_SITE,
        _client.WorkOrderStatus.ASSIGNED
    ],
    [_client.WorkOrderStatus.ON_SITE]: [
        _client.WorkOrderStatus.IN_PROGRESS,
        _client.WorkOrderStatus.EN_ROUTE
    ],
    [_client.WorkOrderStatus.IN_PROGRESS]: [
        _client.WorkOrderStatus.COMPLETED,
        _client.WorkOrderStatus.ON_SITE
    ],
    [_client.WorkOrderStatus.COMPLETED]: [
        _client.WorkOrderStatus.INVOICED
    ],
    [_client.WorkOrderStatus.INVOICED]: [
        _client.WorkOrderStatus.PAID
    ],
    [_client.WorkOrderStatus.PAID]: []
};
function validateTransition(from, to) {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
        throw new _common.BadRequestException(`Invalid status transition from ${from} to ${to}`);
    }
}

//# sourceMappingURL=work-order-state-machine.js.map