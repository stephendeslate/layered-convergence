import { describe, it, expect, vi } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { Prisma } from '@prisma/client';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

function createMockHost(mockResponse: Record<string, unknown>): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
      getRequest: () => ({}),
      getNext: () => vi.fn(),
    }),
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToRpc: () => ({} as any),
    switchToWs: () => ({} as any),
    getType: () => 'http' as any,
  };
}

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  it('should return 409 for P2002 (unique constraint)', () => {
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const mockResponse = { status: mockStatus };

    const exception = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '6.0.0' },
    );

    filter.catch(exception, createMockHost(mockResponse));

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        error: 'P2002',
      }),
    );
  });

  it('should return 404 for P2025 (record not found)', () => {
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const mockResponse = { status: mockStatus };

    const exception = new Prisma.PrismaClientKnownRequestError(
      'Record not found',
      { code: 'P2025', clientVersion: '6.0.0' },
    );

    filter.catch(exception, createMockHost(mockResponse));

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'P2025',
      }),
    );
  });

  it('should return 500 for unknown Prisma error codes', () => {
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const mockResponse = { status: mockStatus };

    const exception = new Prisma.PrismaClientKnownRequestError(
      'Unknown error',
      { code: 'P9999', clientVersion: '6.0.0' },
    );

    filter.catch(exception, createMockHost(mockResponse));

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should include the error code in the response', () => {
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const mockResponse = { status: mockStatus };

    const exception = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint',
      { code: 'P2002', clientVersion: '6.0.0' },
    );

    filter.catch(exception, createMockHost(mockResponse));

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'P2002' }),
    );
  });
});
