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
        let status;
        let message;
        switch(exception.code){
            case 'P2002':
                {
                    status = _common.HttpStatus.CONFLICT;
                    const target = exception.meta?.target ?? [];
                    message = `Unique constraint violation on: ${target.join(', ')}`;
                    break;
                }
            case 'P2025':
                {
                    status = _common.HttpStatus.NOT_FOUND;
                    message = exception.meta?.cause ?? 'Record not found';
                    break;
                }
            default:
                {
                    status = _common.HttpStatus.INTERNAL_SERVER_ERROR;
                    message = 'An unexpected database error occurred';
                    break;
                }
        }
        response.status(status).json({
            statusCode: status,
            message,
            error: exception.code
        });
    }
};
PrismaExceptionFilter = _ts_decorate([
    (0, _common.Catch)(_client.Prisma.PrismaClientKnownRequestError)
], PrismaExceptionFilter);

//# sourceMappingURL=prisma-exception.filter.js.map