"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EmbedConfigsModule", {
    enumerable: true,
    get: function() {
        return EmbedConfigsModule;
    }
});
const _common = require("@nestjs/common");
const _embedconfigsservice = require("./embed-configs.service");
const _embedconfigscontroller = require("./embed-configs.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let EmbedConfigsModule = class EmbedConfigsModule {
};
EmbedConfigsModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _embedconfigscontroller.EmbedConfigsController
        ],
        providers: [
            _embedconfigsservice.EmbedConfigsService
        ],
        exports: [
            _embedconfigsservice.EmbedConfigsService
        ]
    })
], EmbedConfigsModule);

//# sourceMappingURL=embed-configs.module.js.map