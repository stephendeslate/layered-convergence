"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _common = require("@nestjs/common");
const _prismaexceptionfilter = require("./prisma-exception.filter");
function createMockHost(statusFn, jsonFn) {
    return {
        switchToHttp: ()=>({
                getResponse: ()=>({
                        status: statusFn.mockReturnThis(),
                        json: jsonFn
                    })
            })
    };
}
function createPrismaError(code) {
    const error = new Error('Prisma error');
    error.code = code;
    error.clientVersion = '6.0.0';
    error.name = 'PrismaClientKnownRequestError';
    return error;
}
describe('PrismaExceptionFilter', ()=>{
    let filter;
    let statusFn;
    let jsonFn;
    beforeEach(()=>{
        filter = new _prismaexceptionfilter.PrismaExceptionFilter();
        statusFn = vi.fn().mockReturnThis();
        jsonFn = vi.fn();
    });
    it('should map P2002 to 409 CONFLICT', ()=>{
        const host = createMockHost(statusFn, jsonFn);
        filter.catch(createPrismaError('P2002'), host);
        expect(statusFn).toHaveBeenCalledWith(_common.HttpStatus.CONFLICT);
        expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 409,
            error: 'P2002'
        }));
    });
    it('should map P2025 to 404 NOT_FOUND', ()=>{
        const host = createMockHost(statusFn, jsonFn);
        filter.catch(createPrismaError('P2025'), host);
        expect(statusFn).toHaveBeenCalledWith(_common.HttpStatus.NOT_FOUND);
    });
    it('should map P2003 to 400 BAD_REQUEST', ()=>{
        const host = createMockHost(statusFn, jsonFn);
        filter.catch(createPrismaError('P2003'), host);
        expect(statusFn).toHaveBeenCalledWith(_common.HttpStatus.BAD_REQUEST);
    });
    it('should map P2014 to 400 BAD_REQUEST', ()=>{
        const host = createMockHost(statusFn, jsonFn);
        filter.catch(createPrismaError('P2014'), host);
        expect(statusFn).toHaveBeenCalledWith(_common.HttpStatus.BAD_REQUEST);
    });
    it('should map unknown Prisma errors to 500', ()=>{
        const host = createMockHost(statusFn, jsonFn);
        filter.catch(createPrismaError('P9999'), host);
        expect(statusFn).toHaveBeenCalledWith(_common.HttpStatus.INTERNAL_SERVER_ERROR);
    });
});

//# sourceMappingURL=prisma-exception.filter.spec.js.map