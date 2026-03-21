"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _prismaexceptionfilter = require("./prisma-exception.filter");
const _client = require("@prisma/client");
const _common = require("@nestjs/common");
function createMockHost() {
    const json = _vitest.vi.fn();
    const status = _vitest.vi.fn().mockReturnValue({
        json
    });
    const response = {
        status
    };
    const host = {
        switchToHttp: ()=>({
                getResponse: ()=>response
            })
    };
    return {
        host,
        status,
        json
    };
}
(0, _vitest.describe)('PrismaExceptionFilter', ()=>{
    const filter = new _prismaexceptionfilter.PrismaExceptionFilter();
    (0, _vitest.it)('should handle P2002 unique constraint violation with 409', ()=>{
        const { host, status, json } = createMockHost();
        const error = new _client.Prisma.PrismaClientKnownRequestError('Unique constraint', {
            code: 'P2002',
            clientVersion: '6.0.0',
            meta: {
                target: [
                    'email'
                ]
            }
        });
        filter.catch(error, host);
        (0, _vitest.expect)(status).toHaveBeenCalledWith(_common.HttpStatus.CONFLICT);
        (0, _vitest.expect)(json).toHaveBeenCalledWith(_vitest.expect.objectContaining({
            statusCode: 409,
            message: _vitest.expect.stringContaining('email')
        }));
    });
    (0, _vitest.it)('should handle P2025 record not found with 404', ()=>{
        const { host, status, json } = createMockHost();
        const error = new _client.Prisma.PrismaClientKnownRequestError('Record not found', {
            code: 'P2025',
            clientVersion: '6.0.0'
        });
        filter.catch(error, host);
        (0, _vitest.expect)(status).toHaveBeenCalledWith(_common.HttpStatus.NOT_FOUND);
        (0, _vitest.expect)(json).toHaveBeenCalledWith(_vitest.expect.objectContaining({
            statusCode: 404
        }));
    });
    (0, _vitest.it)('should handle P2003 foreign key violation with 400', ()=>{
        const { host, status, json } = createMockHost();
        const error = new _client.Prisma.PrismaClientKnownRequestError('FK violation', {
            code: 'P2003',
            clientVersion: '6.0.0'
        });
        filter.catch(error, host);
        (0, _vitest.expect)(status).toHaveBeenCalledWith(_common.HttpStatus.BAD_REQUEST);
    });
    (0, _vitest.it)('should handle unknown Prisma errors with 500', ()=>{
        const { host, status } = createMockHost();
        const error = new _client.Prisma.PrismaClientKnownRequestError('Unknown', {
            code: 'P9999',
            clientVersion: '6.0.0'
        });
        filter.catch(error, host);
        (0, _vitest.expect)(status).toHaveBeenCalledWith(_common.HttpStatus.INTERNAL_SERVER_ERROR);
    });
    (0, _vitest.it)('should handle P2002 with empty target', ()=>{
        const { host, json } = createMockHost();
        const error = new _client.Prisma.PrismaClientKnownRequestError('Unique', {
            code: 'P2002',
            clientVersion: '6.0.0',
            meta: {}
        });
        filter.catch(error, host);
        (0, _vitest.expect)(json).toHaveBeenCalledWith(_vitest.expect.objectContaining({
            message: _vitest.expect.stringContaining('Unique constraint')
        }));
    });
});

//# sourceMappingURL=prisma-exception.filter.spec.js.map