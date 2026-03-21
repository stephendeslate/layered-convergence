"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _common = require("@nestjs/common");
const _throttleguard = require("./throttle.guard");
function createMockContext(ip = '127.0.0.1') {
    return {
        switchToHttp: ()=>({
                getRequest: ()=>({
                        ip,
                        headers: {}
                    })
            })
    };
}
describe('ThrottleGuard', ()=>{
    it('should allow first request', ()=>{
        const guard = new _throttleguard.ThrottleGuard(100, 60000);
        const result = guard.canActivate(createMockContext());
        expect(result).toBe(true);
    });
    it('should allow multiple requests under limit', ()=>{
        const guard = new _throttleguard.ThrottleGuard(5, 60000);
        const ctx = createMockContext();
        for(let i = 0; i < 5; i++){
            expect(guard.canActivate(ctx)).toBe(true);
        }
    });
    it('should reject request over limit', ()=>{
        const guard = new _throttleguard.ThrottleGuard(2, 60000);
        const ctx = createMockContext();
        guard.canActivate(ctx);
        guard.canActivate(ctx);
        expect(()=>guard.canActivate(ctx)).toThrow(_common.HttpException);
    });
    it('should track different IPs separately', ()=>{
        const guard = new _throttleguard.ThrottleGuard(1, 60000);
        expect(guard.canActivate(createMockContext('1.1.1.1'))).toBe(true);
        expect(guard.canActivate(createMockContext('2.2.2.2'))).toBe(true);
    });
    it('should use default limit and window', ()=>{
        const guard = new _throttleguard.ThrottleGuard();
        expect(guard.canActivate(createMockContext())).toBe(true);
    });
});

//# sourceMappingURL=throttle.guard.spec.js.map