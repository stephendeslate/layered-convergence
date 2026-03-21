import { describe, it, expect, vi } from 'vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';

function createMockHost(mockJson: ReturnType<typeof vi.fn>) {
  return {
    switchToHttp: () => ({
      getResponse: () => ({
        status: vi.fn().mockReturnValue({ json: mockJson }),
      }),
    }),
  } as any;
}

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException with object response', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);
    const exception = new HttpException({ statusCode: 400, message: 'Bad' }, 400);

    filter.catch(exception, host);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
  });

  it('should handle HttpException with string response', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);
    const exception = new HttpException('Not Found', 404);

    filter.catch(exception, host);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, message: 'Not Found' }),
    );
  });

  it('should handle Prisma P2002 unique constraint error', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);
    const exception = { code: 'P2002', message: 'Unique constraint', meta: {} };

    filter.catch(exception, host);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        error: 'P2002',
      }),
    );
  });

  it('should handle Prisma P2025 not found error', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);
    const exception = { code: 'P2025', message: 'Record not found' };

    filter.catch(exception, host);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'P2025',
      }),
    );
  });

  it('should handle Prisma P2003 foreign key constraint error', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);
    const exception = { code: 'P2003', message: 'FK constraint' };

    filter.catch(exception, host);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'P2003',
      }),
    );
  });

  it('should handle unknown Prisma errors as 500', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);
    const exception = { code: 'P9999', message: 'Unknown' };

    filter.catch(exception, host);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      }),
    );
  });

  it('should handle non-Prisma, non-HTTP errors as 500', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);
    const exception = new Error('Something went wrong');

    filter.catch(exception, host);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });

  it('should handle null exception as 500', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);

    filter.catch(null, host);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      }),
    );
  });
});
