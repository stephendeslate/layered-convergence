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
    get CurrentTenant () {
        return CurrentTenant;
    },
    get TenantId () {
        return TenantId;
    }
});
const _common = require("@nestjs/common");
const TenantId = (0, _common.createParamDecorator)((_data, ctx)=>{
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
});
const CurrentTenant = (0, _common.createParamDecorator)((_data, ctx)=>{
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
});

//# sourceMappingURL=tenant.decorator.js.map