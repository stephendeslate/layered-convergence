import { describe, it, expect, vi, beforeEach } from 'vitest';
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

function createPrismaError(
  code: string,
  meta?: Record<string, unknown>,
): Prisma.PrismaClientKnownRequestError {
  const error = new Prisma.PrismaClientKnownRequestError('Test error', {
    code,
    clientVersion: '6.0.0',
    meta,
  });
  return error;
}

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle P2002 unique constraint violation as 409 Conflict', () => {
    const { host, mockStatus, mockJson } = createMockHost();
    const error = createPrismaError('P2002', { target: ['email', 'tenantId'] });

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'Unique constraint violation on: email, tenantId',
      error: 'Conflict',
    });
  });

  it('should handle P2002 without target meta gracefully', () => {
    const { host, mockStatus, mockJson } = createMockHost();
    const error = createPrismaError('P2002', {});

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: 'Unique constraint violation on: field',
      }),
    );
  });

  it('should handle P2025 record not found as 404 Not Found', () => {
    const { host, mockStatus, mockJson } = createMockHost();
    const error = createPrismaError('P2025');

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Record not found',
      error: 'Not Found',
    });
  });

  it('should handle P2003 foreign key constraint as 400 Bad Request', () => {
    const { host, mockStatus, mockJson } = createMockHost();
    const error = createPrismaError('P2003', { field_name: 'tenantId' });

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Foreign key constraint failed on: tenantId',
      error: 'Bad Request',
    });
  });

  it('should handle P2003 without field_name meta gracefully', () => {
    const { host, mockStatus, mockJson } = createMockHost();
    const error = createPrismaError('P2003', {});

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Foreign key constraint failed on: field',
      }),
    );
  });

  it('should handle unknown Prisma error codes as 500', () => {
    const { host, mockStatus, mockJson } = createMockHost();
    const error = createPrismaError('P9999');

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected database error occurred',
      error: 'Internal Server Error',
    });
  });
});
