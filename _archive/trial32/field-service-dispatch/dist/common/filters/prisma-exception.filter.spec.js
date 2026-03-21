"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _prismaexceptionfilter = require("./prisma-exception.filter");
const _client = require("@prisma/client");
const _common = require("@nestjs/common");
(0, _vitest.describe)('PrismaExceptionFilter', ()=>{
    const filter = new _prismaexceptionfilter.PrismaExceptionFilter();
    const createMockHost = ()=>{
        const json = _vitest.vi.fn();
        const status = _vitest.vi.fn().mockReturnValue({
            json
        });
        return {
            switchToHttp: ()=>({
                    getResponse: ()=>({
                            status
                        })
                }),
            json,
            status
        };
    };
    (0, _vitest.it)('should return 409 for P2002 (unique constraint)', ()=>{
        const { status, json, ...host } = createMockHost();
        const error = new _client.Prisma.PrismaClientKnownRequestError('Unique', {
            code: 'P2002',
            meta: {
                target: [
                    'email'
                ]
            },
            clientVersion: '6.0.0'
        });
        filter.catch(error, host);
        (0, _vitest.expect)(status).toHaveBeenCalledWith(_common.HttpStatus.CONFLICT);
        (0, _vitest.expect)(json).toHaveBeenCalledWith(_vitest.expect.objectContaining({
            statusCode: 409
        }));
    });
    (0, _vitest.it)('should return 404 for P2025 (record not found)', ()=>{
        const { status, json, ...host } = createMockHost();
        const error = new _client.Prisma.PrismaClientKnownRequestError('Not found', {
            code: 'P2025',
            clientVersion: '6.0.0'
        });
        filter.catch(error, host);
        (0, _vitest.expect)(status).toHaveBeenCalledWith(_common.HttpStatus.NOT_FOUND);
    });
    (0, _vitest.it)('should return 400 for P2003 (foreign key)', ()=>{
        const { status, json, ...host } = createMockHost();
        const error = new _client.Prisma.PrismaClientKnownRequestError('FK', {
            code: 'P2003',
            clientVersion: '6.0.0'
        });
        filter.catch(error, host);
        (0, _vitest.expect)(status).toHaveBeenCalledWith(_common.HttpStatus.BAD_REQUEST);
    });
    (0, _vitest.it)('should return 500 for unknown error codes', ()=>{
        const { status, json, ...host } = createMockHost();
        const error = new _client.Prisma.PrismaClientKnownRequestError('Unknown', {
            code: 'P9999',
            clientVersion: '6.0.0'
        });
        filter.catch(error, host);
        (0, _vitest.expect)(status).toHaveBeenCalledWith(_common.HttpStatus.INTERNAL_SERVER_ERROR);
    });
    (0, _vitest.it)('should include constraint fields in P2002 message', ()=>{
        const { status, json, ...host } = createMockHost();
        const error = new _client.Prisma.PrismaClientKnownRequestError('Unique', {
            code: 'P2002',
            meta: {
                target: [
                    'email',
                    'companyId'
                ]
            },
            clientVersion: '6.0.0'
        });
        filter.catch(error, host);
        (0, _vitest.expect)(json).toHaveBeenCalledWith(_vitest.expect.objectContaining({
            message: _vitest.expect.stringContaining('email')
        }));
    });
});

//# sourceMappingURL=prisma-exception.filter.spec.js.map