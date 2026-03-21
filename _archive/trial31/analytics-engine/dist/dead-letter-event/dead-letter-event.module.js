"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DeadLetterEventModule", {
    enumerable: true,
    get: function() {
        return DeadLetterEventModule;
    }
});
const _common = require("@nestjs/common");
const _deadlettereventservice = require("./dead-letter-event.service");
const _deadlettereventcontroller = require("./dead-letter-event.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let DeadLetterEventModule = class DeadLetterEventModule {
};
DeadLetterEventModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _deadlettereventcontroller.DeadLetterEventController
        ],
        providers: [
            _deadlettereventservice.DeadLetterEventService
        ],
        exports: [
            _deadlettereventservice.DeadLetterEventService
        ]
    })
], DeadLetterEventModule);

//# sourceMappingURL=dead-letter-event.module.js.map