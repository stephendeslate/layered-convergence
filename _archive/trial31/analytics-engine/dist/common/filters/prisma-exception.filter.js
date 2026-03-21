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
        const mapping = PrismaExceptionFilter.ERROR_MAP[exception.code];
        if (mapping) {
            response.status(mapping.status).json({
                statusCode: mapping.status,
                message: mapping.message,
                error: exception.code
            });
        } else {
            response.status(_common.HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: _common.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
                error: exception.code
            });
        }
    }
};
PrismaExceptionFilter.ERROR_MAP = {
    P2002: {
        status: _common.HttpStatus.CONFLICT,
        message: 'A record with that unique constraint already exists'
    },
    P2025: {
        status: _common.HttpStatus.NOT_FOUND,
        message: 'Record not found'
    },
    P2003: {
        status: _common.HttpStatus.BAD_REQUEST,
        message: 'Foreign key constraint violation'
    },
    P2014: {
        status: _common.HttpStatus.BAD_REQUEST,
        message: 'Required relation violation'
    }
};
PrismaExceptionFilter = _ts_decorate([
    (0, _common.Catch)(_client.Prisma.PrismaClientKnownRequestError)
], PrismaExceptionFilter);

//# sourceMappingURL=prisma-exception.filter.js.map