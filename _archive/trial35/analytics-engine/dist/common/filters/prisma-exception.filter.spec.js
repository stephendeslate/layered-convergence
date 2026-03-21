"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaexceptionfilter = require("./prisma-exception.filter");
describe('PrismaExceptionFilter', ()=>{
    let filter;
    let mockResponse;
    let mockHost;
    beforeEach(()=>{
        filter = new _prismaexceptionfilter.PrismaExceptionFilter();
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };
        mockHost = {
            switchToHttp: ()=>({
                    getResponse: ()=>mockResponse
                })
        };
    });
    it('should be defined', ()=>{
        expect(filter).toBeDefined();
    });
    it('should return 409 for P2002 unique constraint violation', ()=>{
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
        expect(mockResponse.status).toHaveBeenCalledWith(_common.HttpStatus.CONFLICT);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: _common.HttpStatus.CONFLICT,
            error: 'P2002'
        }));
    });
    it('should include target fields in P2002 message', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Unique', {
            code: 'P2002',
            clientVersion: '6.0.0',
            meta: {
                target: [
                    'email',
                    'name'
                ]
            }
        });
        filter.catch(exception, mockHost);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('email, name')
        }));
    });
    it('should return 404 for P2025 record not found', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Not found', {
            code: 'P2025',
            clientVersion: '6.0.0',
            meta: {
                cause: 'Record to update not found'
            }
        });
        filter.catch(exception, mockHost);
        expect(mockResponse.status).toHaveBeenCalledWith(_common.HttpStatus.NOT_FOUND);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: _common.HttpStatus.NOT_FOUND,
            error: 'P2025'
        }));
    });
    it('should use cause from meta for P2025 message', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Not found', {
            code: 'P2025',
            clientVersion: '6.0.0',
            meta: {
                cause: 'Record to delete not found'
            }
        });
        filter.catch(exception, mockHost);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Record to delete not found'
        }));
    });
    it('should return default message for P2025 without cause', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Not found', {
            code: 'P2025',
            clientVersion: '6.0.0'
        });
        filter.catch(exception, mockHost);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Record not found'
        }));
    });
    it('should return 500 for unknown error codes', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Unknown', {
            code: 'P2003',
            clientVersion: '6.0.0'
        });
        filter.catch(exception, mockHost);
        expect(mockResponse.status).toHaveBeenCalledWith(_common.HttpStatus.INTERNAL_SERVER_ERROR);
    });
    it('should handle P2002 with empty target array', ()=>{
        const exception = new _client.Prisma.PrismaClientKnownRequestError('Unique', {
            code: 'P2002',
            clientVersion: '6.0.0',
            meta: {
                target: []
            }
        });
        filter.catch(exception, mockHost);
        expect(mockResponse.status).toHaveBeenCalledWith(_common.HttpStatus.CONFLICT);
    });
});

//# sourceMappingURL=prisma-exception.filter.spec.js.map