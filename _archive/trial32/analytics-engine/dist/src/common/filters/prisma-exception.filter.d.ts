import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
type PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;
declare const PrismaClientKnownRequestError: typeof import("@prisma/client-runtime-utils").PrismaClientKnownRequestError;
export declare class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost): void;
}
export {};
