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
    get AuthGuard () {
        return AuthGuard;
    },
    get IS_PUBLIC_KEY () {
        return IS_PUBLIC_KEY;
    }
});
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const IS_PUBLIC_KEY = 'isPublic';
let AuthGuard = class AuthGuard {
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new _common.UnauthorizedException('Missing or invalid authorization token');
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString());
            request.user = {
                userId: payload.sub,
                email: payload.email,
                role: payload.role,
                companyId: payload.companyId
            };
            return true;
        } catch  {
            throw new _common.UnauthorizedException('Invalid token');
        }
    }
    constructor(reflector){
        this.reflector = reflector;
    }
};
AuthGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _core.Reflector === "undefined" ? Object : _core.Reflector
    ])
], AuthGuard);

//# sourceMappingURL=auth.guard.js.map