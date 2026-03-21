"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const common_1 = require("@nestjs/common");
const prisma_exception_filter_js_1 = require("./prisma-exception.filter.js");
(0, vitest_1.describe)('PrismaExceptionFilter', () => {
    const filter = new prisma_exception_filter_js_1.PrismaExceptionFilter();
    function createHost(responseMock) {
        return {
            switchToHttp: () => ({
                getResponse: () => responseMock,
                getRequest: () => ({}),
            }),
        };
    }
    function createResponse() {
        const res = {
            statusCode: 0,
            body: null,
            status: vitest_1.vi.fn().mockReturnThis(),
            json: vitest_1.vi.fn().mockReturnThis(),
        };
        return res;
    }
    (0, vitest_1.it)('should be defined', () => {
        (0, vitest_1.expect)(filter).toBeDefined();
    });
    (0, vitest_1.it)('should handle HttpException', () => {
        const res = createResponse();
        const host = createHost(res);
        const exception = new common_1.HttpException('Bad Request', common_1.HttpStatus.BAD_REQUEST);
        filter.catch(exception, host);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(400);
    });
    (0, vitest_1.it)('should handle HttpException with object response', () => {
        const res = createResponse();
        const host = createHost(res);
        const exception = new common_1.HttpException({ statusCode: 400, message: 'Validation failed' }, 400);
        filter.catch(exception, host);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(400);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({ statusCode: 400, message: 'Validation failed' });
    });
    (0, vitest_1.it)('should handle HttpException with string response', () => {
        const res = createResponse();
        const host = createHost(res);
        const exception = new common_1.HttpException('Not Found', 404);
        filter.catch(exception, host);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(404);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({ statusCode: 404, message: 'Not Found' });
    });
    (0, vitest_1.it)('should handle P2002 (unique constraint) as 409 Conflict', () => {
        const res = createResponse();
        const host = createHost(res);
        const exception = { code: 'P2002', message: 'Unique constraint', meta: {} };
        filter.catch(exception, host);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(common_1.HttpStatus.CONFLICT);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ statusCode: 409, error: 'P2002' }));
    });
    (0, vitest_1.it)('should handle P2025 (record not found) as 404', () => {
        const res = createResponse();
        const host = createHost(res);
        const exception = { code: 'P2025', message: 'Record not found' };
        filter.catch(exception, host);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(common_1.HttpStatus.NOT_FOUND);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ statusCode: 404, error: 'P2025' }));
    });
    (0, vitest_1.it)('should handle P2003 (foreign key) as 400', () => {
        const res = createResponse();
        const host = createHost(res);
        const exception = { code: 'P2003', message: 'Foreign key constraint failed' };
        filter.catch(exception, host);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(common_1.HttpStatus.BAD_REQUEST);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ statusCode: 400, error: 'P2003' }));
    });
    (0, vitest_1.it)('should handle unknown Prisma error as 500', () => {
        const res = createResponse();
        const host = createHost(res);
        const exception = { code: 'P9999', message: 'Unknown Prisma error' };
        filter.catch(exception, host);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    });
    (0, vitest_1.it)('should handle generic unknown errors as 500', () => {
        const res = createResponse();
        const host = createHost(res);
        filter.catch(new Error('Something broke'), host);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ statusCode: 500, message: 'Internal server error' }));
    });
    (0, vitest_1.it)('should handle null exception as 500', () => {
        const res = createResponse();
        const host = createHost(res);
        filter.catch(null, host);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(500);
    });
});
//# sourceMappingURL=prisma-exception.filter.spec.js.map