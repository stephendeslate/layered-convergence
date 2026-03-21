"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ThrottleGuard", {
    enumerable: true,
    get: function() {
        return ThrottleGuard;
    }
});
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ThrottleGuard = class ThrottleGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const key = request.ip || request.headers['x-forwarded-for'] || 'unknown';
        const now = Date.now();
        const entry = this.requests.get(key);
        if (!entry || now > entry.resetAt) {
            this.requests.set(key, {
                count: 1,
                resetAt: now + this.windowMs
            });
            return true;
        }
        if (entry.count >= this.limit) {
            throw new _common.HttpException('Too many requests', _common.HttpStatus.TOO_MANY_REQUESTS);
        }
        entry.count++;
        return true;
    }
    constructor(limit = 100, windowMs = 60_000){
        this.requests = new Map();
        this.limit = limit;
        this.windowMs = windowMs;
    }
};
ThrottleGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        void 0
    ])
], ThrottleGuard);

//# sourceMappingURL=throttle.guard.js.map