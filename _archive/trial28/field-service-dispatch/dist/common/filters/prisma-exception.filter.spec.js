"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _vitest = require("vitest");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaexceptionfilter = require("./prisma-exception.filter");
const mockJson = _vitest.vi.fn();
const mockStatus = _vitest.vi.fn().mockReturnValue({
    json: mockJson
});
const mockGetResponse = _vitest.vi.fn().mockReturnValue({
    status: mockStatus
});
const mockSwitchToHttp = _vitest.vi.fn().mockReturnValue({
    getResponse: mockGetResponse
});
const mockHost = {
    switchToHttp: mockSwitchToHttp
};
(0, _vitest.describe)('PrismaExceptionFilter', ()=>{
    let filter;
    (0, _vitest.beforeEach)(()=>{
        _vitest.vi.clearAllMocks();
        filter = new _prismaexceptionfilter.PrismaExceptionFilter();
    });
    (0, _vitest.it)('should handle P2002 (unique constraint) as 409', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Unique', {
            code: 'P2002',
            meta: {
                target: [
                    'email'
                ]
            },
            clientVersion: '6.0.0'
        });
        filter.catch(exception, mockHost);
        (0, _vitest.expect)(mockStatus).toHaveBeenCalledWith(_common.HttpStatus.CONFLICT);
        (0, _vitest.expect)(mockJson).toHaveBeenCalledWith(_vitest.expect.objectContaining({
            statusCode: 409,
            message: _vitest.expect.stringContaining('email')
        }));
    });
    (0, _vitest.it)('should handle P2025 (not found) as 404', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Not found', {
            code: 'P2025',
            clientVersion: '6.0.0'
        });
        filter.catch(exception, mockHost);
        (0, _vitest.expect)(mockStatus).toHaveBeenCalledWith(_common.HttpStatus.NOT_FOUND);
        (0, _vitest.expect)(mockJson).toHaveBeenCalledWith(_vitest.expect.objectContaining({
            statusCode: 404
        }));
    });
    (0, _vitest.it)('should handle P2003 (foreign key) as 400', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('FK', {
            code: 'P2003',
            clientVersion: '6.0.0'
        });
        filter.catch(exception, mockHost);
        (0, _vitest.expect)(mockStatus).toHaveBeenCalledWith(_common.HttpStatus.BAD_REQUEST);
    });
    (0, _vitest.it)('should handle unknown Prisma error as 500', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Unknown', {
            code: 'P9999',
            clientVersion: '6.0.0'
        });
        filter.catch(exception, mockHost);
        (0, _vitest.expect)(mockStatus).toHaveBeenCalledWith(_common.HttpStatus.INTERNAL_SERVER_ERROR);
    });
    (0, _vitest.it)('should handle P2002 without meta target', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Unique', {
            code: 'P2002',
            clientVersion: '6.0.0'
        });
        filter.catch(exception, mockHost);
        (0, _vitest.expect)(mockStatus).toHaveBeenCalledWith(_common.HttpStatus.CONFLICT);
    });
});

//# sourceMappingURL=prisma-exception.filter.spec.js.map