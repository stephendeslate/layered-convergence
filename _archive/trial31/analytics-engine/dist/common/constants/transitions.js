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
    get DATA_SOURCE_TRANSITIONS () {
        return DATA_SOURCE_TRANSITIONS;
    },
    get VALID_TRANSITIONS () {
        return VALID_TRANSITIONS;
    }
});
const VALID_TRANSITIONS = {
    pending: [
        'running'
    ],
    running: [
        'completed',
        'failed'
    ],
    completed: [],
    failed: [
        'pending'
    ]
};
const DATA_SOURCE_TRANSITIONS = {
    active: [
        'paused',
        'archived'
    ],
    paused: [
        'active',
        'archived'
    ],
    archived: []
};

//# sourceMappingURL=transitions.js.map