import { PrismaExceptionFilter } from './prisma-exception.filter.js';
import { HttpStatus } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';

const PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

function createMockHost(statusFn: ReturnType<typeof vi.fn>, jsonFn: ReturnType<typeof vi.fn>) {
  return {
    switchToHttp: () => ({
      getResponse: () => ({
        status: statusFn,
      }),
    }),
  } as any;
}

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let statusFn: ReturnType<typeof vi.fn>;
  let jsonFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
    jsonFn = vi.fn();
    statusFn = vi.fn().mockReturnValue({ json: jsonFn });
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should return 409 for P2002 (unique constraint)', () => {
    const exception = new PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '6.0.0',
    });

    const host = createMockHost(statusFn, jsonFn);
    filter.catch(exception, host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(jsonFn).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'A record with this value already exists',
    });
  });

  it('should return 404 for P2025 (record not found)', () => {
    const exception = new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '6.0.0',
    });

    const host = createMockHost(statusFn, jsonFn);
    filter.catch(exception, host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonFn).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Record not found',
    });
  });

  it('should return 400 for P2003 (foreign key constraint)', () => {
    const exception = new PrismaClientKnownRequestError('Foreign key constraint failed', {
      code: 'P2003',
      clientVersion: '6.0.0',
    });

    const host = createMockHost(statusFn, jsonFn);
    filter.catch(exception, host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonFn).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Foreign key constraint failed',
    });
  });

  it('should return 500 for unknown Prisma error codes', () => {
    const exception = new PrismaClientKnownRequestError('Unknown error', {
      code: 'P9999',
      clientVersion: '6.0.0',
    });

    const host = createMockHost(statusFn, jsonFn);
    filter.catch(exception, host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(jsonFn).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
});
