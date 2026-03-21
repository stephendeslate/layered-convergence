"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WorkOrdersModule", {
    enumerable: true,
    get: function() {
        return WorkOrdersModule;
    }
});
const _common = require("@nestjs/common");
const _workordersservice = require("./work-orders.service");
const _workorderscontroller = require("./work-orders.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let WorkOrdersModule = class WorkOrdersModule {
};
WorkOrdersModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _workorderscontroller.WorkOrdersController
        ],
        providers: [
            _workordersservice.WorkOrdersService
        ],
        exports: [
            _workordersservice.WorkOrdersService
        ]
    })
], WorkOrdersModule);

//# sourceMappingURL=work-orders.module.js.map