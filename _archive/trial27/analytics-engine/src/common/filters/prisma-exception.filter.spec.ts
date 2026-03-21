import { describe, it, expect, vi } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  function createMockHost(json: ReturnType<typeof vi.fn>, statusFn: ReturnType<typeof vi.fn>) {
    return {
      switchToHttp: () => ({
        getResponse: () => ({
          status: statusFn.mockReturnValue({ json }),
        }),
      }),
    } as any;
  }

  function createPrismaError(code: string): Prisma.PrismaClientKnownRequestError {
    return new Prisma.PrismaClientKnownRequestError('Test error', {
      code,
      clientVersion: '6.0.0',
    });
  }

  it('should return 409 for P2002 unique constraint violation', () => {
    const json = vi.fn();
    const status = vi.fn();
    const host = createMockHost(json, status);

    filter.catch(createPrismaError('P2002'), host);
    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return conflict message for P2002', () => {
    const json = vi.fn();
    const status = vi.fn();
    const host = createMockHost(json, status);

    filter.catch(createPrismaError('P2002'), host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'A record with this value already exists' }),
    );
  });

  it('should return 404 for P2025 not found', () => {
    const json = vi.fn();
    const status = vi.fn();
    const host = createMockHost(json, status);

    filter.catch(createPrismaError('P2025'), host);
    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('should return not found message for P2025', () => {
    const json = vi.fn();
    const status = vi.fn();
    const host = createMockHost(json, status);

    filter.catch(createPrismaError('P2025'), host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Record not found' }),
    );
  });

  it('should return 500 for unknown Prisma error codes', () => {
    const json = vi.fn();
    const status = vi.fn();
    const host = createMockHost(json, status);

    filter.catch(createPrismaError('P9999'), host);
    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should include error code in response', () => {
    const json = vi.fn();
    const status = vi.fn();
    const host = createMockHost(json, status);

    filter.catch(createPrismaError('P2002'), host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'P2002' }),
    );
  });

  it('should include statusCode in response body', () => {
    const json = vi.fn();
    const status = vi.fn();
    const host = createMockHost(json, status);

    filter.catch(createPrismaError('P2025'), host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: HttpStatus.NOT_FOUND }),
    );
  });
});
