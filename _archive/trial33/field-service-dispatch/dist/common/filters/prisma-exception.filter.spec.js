"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _prismaexceptionfilter = require("./prisma-exception.filter");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
(0, _vitest.describe)('PrismaExceptionFilter', ()=>{
    let filter;
    let mockResponse;
    let mockHost;
    (0, _vitest.beforeEach)(()=>{
        filter = new _prismaexceptionfilter.PrismaExceptionFilter();
        mockResponse = {
            status: _vitest.vi.fn().mockReturnThis(),
            json: _vitest.vi.fn().mockReturnThis()
        };
        mockHost = {
            switchToHttp: _vitest.vi.fn().mockReturnValue({
                getResponse: _vitest.vi.fn().mockReturnValue(mockResponse)
            })
        };
    });
    (0, _vitest.it)('should handle P2002 unique constraint violation', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Unique', {
            code: 'P2002',
            clientVersion: '6.0.0',
            meta: {
                target: [
                    'email'
                ]
            }
        });
        filter.catch(exception, mockHost);
        (0, _vitest.expect)(mockResponse.status).toHaveBeenCalledWith(_common.HttpStatus.CONFLICT);
        (0, _vitest.expect)(mockResponse.json).toHaveBeenCalledWith({
            statusCode: _common.HttpStatus.CONFLICT,
            message: 'Unique constraint violation on: email',
            error: 'Conflict'
        });
    });
    (0, _vitest.it)('should handle P2002 with multiple fields', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Unique', {
            code: 'P2002',
            clientVersion: '6.0.0',
            meta: {
                target: [
                    'email',
                    'companyId'
                ]
            }
        });
        filter.catch(exception, mockHost);
        (0, _vitest.expect)(mockResponse.status).toHaveBeenCalledWith(_common.HttpStatus.CONFLICT);
        (0, _vitest.expect)(mockResponse.json).toHaveBeenCalledWith(_vitest.expect.objectContaining({
            message: 'Unique constraint violation on: email, companyId'
        }));
    });
    (0, _vitest.it)('should handle P2002 with no meta target', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Unique', {
            code: 'P2002',
            clientVersion: '6.0.0'
        });
        filter.catch(exception, mockHost);
        (0, _vitest.expect)(mockResponse.status).toHaveBeenCalledWith(_common.HttpStatus.CONFLICT);
    });
    (0, _vitest.it)('should handle P2025 record not found', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Not found', {
            code: 'P2025',
            clientVersion: '6.0.0'
        });
        filter.catch(exception, mockHost);
        (0, _vitest.expect)(mockResponse.status).toHaveBeenCalledWith(_common.HttpStatus.NOT_FOUND);
        (0, _vitest.expect)(mockResponse.json).toHaveBeenCalledWith({
            statusCode: _common.HttpStatus.NOT_FOUND,
            message: 'Record not found',
            error: 'Not Found'
        });
    });
    (0, _vitest.it)('should handle P2003 foreign key constraint violation', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('FK', {
            code: 'P2003',
            clientVersion: '6.0.0'
        });
        filter.catch(exception, mockHost);
        (0, _vitest.expect)(mockResponse.status).toHaveBeenCalledWith(_common.HttpStatus.BAD_REQUEST);
        (0, _vitest.expect)(mockResponse.json).toHaveBeenCalledWith({
            statusCode: _common.HttpStatus.BAD_REQUEST,
            message: 'Foreign key constraint violation',
            error: 'Bad Request'
        });
    });
    (0, _vitest.it)('should handle unknown error codes with 500', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Unknown', {
            code: 'P9999',
            clientVersion: '6.0.0'
        });
        filter.catch(exception, mockHost);
        (0, _vitest.expect)(mockResponse.status).toHaveBeenCalledWith(_common.HttpStatus.INTERNAL_SERVER_ERROR);
        (0, _vitest.expect)(mockResponse.json).toHaveBeenCalledWith({
            statusCode: _common.HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
            error: 'Internal Server Error'
        });
    });
});

//# sourceMappingURL=prisma-exception.filter.spec.js.map