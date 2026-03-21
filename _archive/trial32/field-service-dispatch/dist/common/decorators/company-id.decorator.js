"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CompanyId", {
    enumerable: true,
    get: function() {
        return CompanyId;
    }
});
const _common = require("@nestjs/common");
const CompanyId = (0, _common.createParamDecorator)((_data, ctx)=>{
    const request = ctx.switchToHttp().getRequest();
    return request.companyId || request.headers['x-company-id'];
});

//# sourceMappingURL=company-id.decorator.js.map