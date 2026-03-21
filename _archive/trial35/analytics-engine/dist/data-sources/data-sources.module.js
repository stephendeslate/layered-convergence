"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DataSourcesModule", {
    enumerable: true,
    get: function() {
        return DataSourcesModule;
    }
});
const _common = require("@nestjs/common");
const _datasourcesservice = require("./data-sources.service");
const _datasourcescontroller = require("./data-sources.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let DataSourcesModule = class DataSourcesModule {
};
DataSourcesModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _datasourcescontroller.DataSourcesController
        ],
        providers: [
            _datasourcesservice.DataSourcesService
        ],
        exports: [
            _datasourcesservice.DataSourcesService
        ]
    })
], DataSourcesModule);

//# sourceMappingURL=data-sources.module.js.map