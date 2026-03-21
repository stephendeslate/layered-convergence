"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _jwtstrategy = require("./jwt.strategy");
describe('JwtStrategy', ()=>{
    let strategy;
    beforeEach(()=>{
        const mockConfig = {
            get: vi.fn().mockReturnValue('test-secret')
        };
        strategy = new _jwtstrategy.JwtStrategy(mockConfig);
    });
    it('should be defined', ()=>{
        expect(strategy).toBeDefined();
    });
    it('should return user object from payload', ()=>{
        const payload = {
            sub: 'user-1',
            email: 'test@example.com',
            role: 'ADMIN',
            tenantId: 'tenant-1'
        };
        const result = strategy.validate(payload);
        expect(result).toEqual({
            id: 'user-1',
            email: 'test@example.com',
            role: 'ADMIN',
            tenantId: 'tenant-1'
        });
    });
    it('should map sub to id', ()=>{
        const payload = {
            sub: 'abc-123',
            email: 'a@b.com',
            role: 'USER'
        };
        const result = strategy.validate(payload);
        expect(result.id).toBe('abc-123');
    });
});

//# sourceMappingURL=jwt.strategy.spec.js.map