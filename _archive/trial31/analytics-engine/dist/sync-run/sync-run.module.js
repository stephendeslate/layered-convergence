"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SyncRunModule", {
    enumerable: true,
    get: function() {
        return SyncRunModule;
    }
});
const _common = require("@nestjs/common");
const _syncrunservice = require("./sync-run.service");
const _syncruncontroller = require("./sync-run.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let SyncRunModule = class SyncRunModule {
};
SyncRunModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _syncruncontroller.SyncRunController
        ],
        providers: [
            _syncrunservice.SyncRunService
        ],
        exports: [
            _syncrunservice.SyncRunService
        ]
    })
], SyncRunModule);

//# sourceMappingURL=sync-run.module.js.map