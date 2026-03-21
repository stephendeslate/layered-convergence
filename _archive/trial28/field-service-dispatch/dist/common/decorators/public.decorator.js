"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Public", {
    enumerable: true,
    get: function() {
        return Public;
    }
});
const _common = require("@nestjs/common");
const _authguard = require("../guards/auth.guard");
const Public = ()=>(0, _common.SetMetadata)(_authguard.IS_PUBLIC_KEY, true);

//# sourceMappingURL=public.decorator.js.map