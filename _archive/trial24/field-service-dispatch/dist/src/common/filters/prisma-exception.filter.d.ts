import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
}
