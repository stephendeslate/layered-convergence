"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PrismaExceptionFilter", {
    enumerable: true,
    get: function() {
        return PrismaExceptionFilter;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let PrismaExceptionFilter = class PrismaExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        switch(exception.code){
            case 'P2002':
                {
                    const target = exception.meta?.target || [];
                    response.status(_common.HttpStatus.CONFLICT).json({
                        statusCode: _common.HttpStatus.CONFLICT,
                        message: `Unique constraint violation on: ${target.join(', ')}`,
                        error: 'Conflict'
                    });
                    break;
                }
            case 'P2025':
                {
                    response.status(_common.HttpStatus.NOT_FOUND).json({
                        statusCode: _common.HttpStatus.NOT_FOUND,
                        message: 'Record not found',
                        error: 'Not Found'
                    });
                    break;
                }
            case 'P2003':
                {
                    response.status(_common.HttpStatus.BAD_REQUEST).json({
                        statusCode: _common.HttpStatus.BAD_REQUEST,
                        message: 'Foreign key constraint violation',
                        error: 'Bad Request'
                    });
                    break;
                }
            default:
                {
                    response.status(_common.HttpStatus.INTERNAL_SERVER_ERROR).json({
                        statusCode: _common.HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'Internal server error',
                        error: 'Internal Server Error'
                    });
                }
        }
    }
};
PrismaExceptionFilter = _ts_decorate([
    (0, _common.Catch)(_client.Prisma.PrismaClientKnownRequestError)
], PrismaExceptionFilter);

//# sourceMappingURL=prisma-exception.filter.js.map