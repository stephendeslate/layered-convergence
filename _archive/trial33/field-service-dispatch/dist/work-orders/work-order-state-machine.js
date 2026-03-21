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
const VALID_TRANSITIONS = {
    UNASSIGNED: [
        'ASSIGNED'
    ],
    ASSIGNED: [
        'UNASSIGNED',
        'EN_ROUTE'
    ],
    EN_ROUTE: [
        'ASSIGNED',
        'ON_SITE'
    ],
    ON_SITE: [
        'EN_ROUTE',
        'IN_PROGRESS'
    ],
    IN_PROGRESS: [
        'ON_SITE',
        'COMPLETED'
    ],
    COMPLETED: [
        'INVOICED'
    ],
    INVOICED: [
        'PAID'
    ],
    PAID: []
};
function validateTransition(from, to) {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
        throw new _common.BadRequestException(`Invalid status transition from ${from} to ${to}`);
    }
}

//# sourceMappingURL=work-order-state-machine.js.map