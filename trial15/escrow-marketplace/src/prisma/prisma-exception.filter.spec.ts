import { describe, it, expect, vi } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { Prisma } from '@prisma/client';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

function createMockHost(): { host: ArgumentsHost; mockJson: ReturnType<typeof vi.fn>; mockStatus: ReturnType<typeof vi.fn> } {
  const mockJson = vi.fn();
  const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status: mockStatus }),
      getRequest: () => ({}),
    }),
    getArgs: () => [],
    getArgByIndex: () => ({}),
    switchToRpc: () => ({} as any),
    switchToWs: () => ({} as any),
    getType: () => 'http' as const,
  } as unknown as ArgumentsHost;

  return { host, mockJson, mockStatus };
}

function createPrismaError(code: string, meta?: Record<string, unknown>): Prisma.PrismaClientKnownRequestError {
  const error = new Prisma.PrismaClientKnownRequestError('Test error', {
    code,
    clientVersion: '6.0.0',
    meta,
  });
  return error;
}

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle P2002 (unique constraint) with 409 Conflict', () => {
    const { host, mockJson, mockStatus } = createMockHost();
    const error = createPrismaError('P2002', { target: ['email'] });

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'Unique constraint violation on: email',
      error: 'P2002',
    });
  });

  it('should handle P2002 with multiple fields', () => {
    const { host, mockJson, mockStatus } = createMockHost();
    const error = createPrismaError('P2002', { target: ['email', 'name'] });

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'Unique constraint violation on: email, name',
      error: 'P2002',
    });
  });

  it('should handle P2002 with no target meta', () => {
    const { host, mockJson, mockStatus } = createMockHost();
    const error = createPrismaError('P2002', {});

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'Unique constraint violation on: ',
      error: 'P2002',
    });
  });

  it('should handle P2025 (not found) with 404 Not Found', () => {
    const { host, mockJson, mockStatus } = createMockHost();
    const error = createPrismaError('P2025');

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Record not found',
      error: 'P2025',
    });
  });

  it('should handle P2003 (foreign key) with 400 Bad Request', () => {
    const { host, mockJson, mockStatus } = createMockHost();
    const error = createPrismaError('P2003', { field_name: 'userId' });

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Foreign key constraint failed on field: userId',
      error: 'P2003',
    });
  });

  it('should handle P2003 with no field_name meta', () => {
    const { host, mockJson, mockStatus } = createMockHost();
    const error = createPrismaError('P2003', {});

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Foreign key constraint failed on field: unknown',
      error: 'P2003',
    });
  });

  it('should handle unknown Prisma error codes with 500', () => {
    const { host, mockJson, mockStatus } = createMockHost();
    const error = createPrismaError('P2999');

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'P2999',
    });
  });
});
