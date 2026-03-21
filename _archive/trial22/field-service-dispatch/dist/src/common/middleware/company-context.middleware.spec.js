"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const common_1 = require("@nestjs/common");
const company_context_middleware_js_1 = require("./company-context.middleware.js");
(0, vitest_1.describe)('CompanyContextMiddleware', () => {
    const middleware = new company_context_middleware_js_1.CompanyContextMiddleware();
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(middleware).toBeDefined();
    });
    (0, vitest_1.it)('should throw BadRequestException when x-company-id is missing', () => {
        const req = { headers: {} };
        const res = {};
        const next = vitest_1.vi.fn();
        (0, vitest_1.expect)(() => middleware.use(req, res, next)).toThrow(common_1.BadRequestException);
    });
    (0, vitest_1.it)('should throw BadRequestException when x-company-id is empty', () => {
        const req = { headers: { 'x-company-id': '' } };
        const res = {};
        const next = vitest_1.vi.fn();
        (0, vitest_1.expect)(() => middleware.use(req, res, next)).toThrow(common_1.BadRequestException);
    });
    (0, vitest_1.it)('should throw BadRequestException when x-company-id is not a string', () => {
        const req = { headers: { 'x-company-id': ['a', 'b'] } };
        const res = {};
        const next = vitest_1.vi.fn();
        (0, vitest_1.expect)(() => middleware.use(req, res, next)).toThrow(common_1.BadRequestException);
    });
    (0, vitest_1.it)('should set companyId on request when valid header provided', () => {
        const req = { headers: { 'x-company-id': 'company-123' } };
        const res = {};
        const next = vitest_1.vi.fn();
        middleware.use(req, res, next);
        (0, vitest_1.expect)(req.companyId).toBe('company-123');
        (0, vitest_1.expect)(next).toHaveBeenCalled();
    });
    (0, vitest_1.it)('should call next() when header is valid', () => {
        const req = { headers: { 'x-company-id': 'valid-id' } };
        const res = {};
        const next = vitest_1.vi.fn();
        middleware.use(req, res, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('should include descriptive error message', () => {
        const req = { headers: {} };
        const res = {};
        const next = vitest_1.vi.fn();
        try {
            middleware.use(req, res, next);
        }
        catch (err) {
            (0, vitest_1.expect)(err.message).toContain('x-company-id');
        }
    });
});
//# sourceMappingURL=company-context.middleware.spec.js.map