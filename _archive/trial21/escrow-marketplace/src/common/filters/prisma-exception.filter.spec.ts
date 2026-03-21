import { describe, it, expect, vi } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { Prisma } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
  });

  const createMockHost = () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    return {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
      json,
      status,
    };
  };

  it('should map P2002 to 409 CONFLICT', () => {
    const host = createMockHost();
    const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '6.0.0',
      meta: { target: ['email'] },
    });

    filter.catch(exception, host as any);

    expect(host.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        error: 'P2002',
      }),
    );
  });

  it('should map P2025 to 404 NOT_FOUND', () => {
    const host = createMockHost();
    const exception = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '6.0.0',
    });

    filter.catch(exception, host as any);

    expect(host.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
      }),
    );
  });

  it('should map P2003 to 400 BAD_REQUEST', () => {
    const host = createMockHost();
    const exception = new Prisma.PrismaClientKnownRequestError('Foreign key', {
      code: 'P2003',
      clientVersion: '6.0.0',
    });

    filter.catch(exception, host as any);

    expect(host.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should map unknown codes to 500', () => {
    const host = createMockHost();
    const exception = new Prisma.PrismaClientKnownRequestError('Unknown', {
      code: 'P9999',
      clientVersion: '6.0.0',
    });

    filter.catch(exception, host as any);

    expect(host.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should include error code in response', () => {
    const host = createMockHost();
    const exception = new Prisma.PrismaClientKnownRequestError('test', {
      code: 'P2002',
      clientVersion: '6.0.0',
      meta: { target: ['email'] },
    });

    filter.catch(exception, host as any);

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'P2002' }),
    );
  });

  it('should handle P2002 with empty target', () => {
    const host = createMockHost();
    const exception = new Prisma.PrismaClientKnownRequestError('test', {
      code: 'P2002',
      clientVersion: '6.0.0',
      meta: {},
    });

    filter.catch(exception, host as any);

    expect(host.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });
});
