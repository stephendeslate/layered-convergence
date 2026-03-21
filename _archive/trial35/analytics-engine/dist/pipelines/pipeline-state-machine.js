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
    get validatePipelineTransition () {
        return validatePipelineTransition;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const VALID_TRANSITIONS = {
    DRAFT: [
        _client.PipelineStatus.ACTIVE
    ],
    ACTIVE: [
        _client.PipelineStatus.PAUSED,
        _client.PipelineStatus.ARCHIVED
    ],
    PAUSED: [
        _client.PipelineStatus.ACTIVE,
        _client.PipelineStatus.ARCHIVED
    ],
    ARCHIVED: []
};
function validatePipelineTransition(from, to) {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
        throw new _common.BadRequestException(`Invalid pipeline transition from ${from} to ${to}`);
    }
}

//# sourceMappingURL=pipeline-state-machine.js.map