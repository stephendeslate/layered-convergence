import { describe, it, expect, vi } from 'vitest';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import { Prisma } from '@prisma/client';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

function createMockHost(): { host: ArgumentsHost; response: { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } } {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const response = { status, json };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({}),
    }),
    getArgs: () => [],
    getArgByIndex: () => null,
    switchToRpc: () => ({} as never),
    switchToWs: () => ({} as never),
    getType: () => 'http' as const,
  } as unknown as ArgumentsHost;

  return { host, response };
}

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  it('maps P2025 to 404 Not Found', () => {
    const { host, response } = createMockHost();
    const exception = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '6.0.0',
    });

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, error: 'P2025' }),
    );
  });

  it('maps P2002 to 409 Conflict', () => {
    const { host, response } = createMockHost();
    const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '6.0.0',
      meta: { target: ['email'] },
    });

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 409, error: 'P2002' }),
    );
  });

  it('maps P2003 to 400 Bad Request', () => {
    const { host, response } = createMockHost();
    const exception = new Prisma.PrismaClientKnownRequestError('Foreign key constraint', {
      code: 'P2003',
      clientVersion: '6.0.0',
      meta: { field_name: 'tenantId' },
    });

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, error: 'P2003' }),
    );
  });

  it('maps unknown Prisma error to 500', () => {
    const { host, response } = createMockHost();
    const exception = new Prisma.PrismaClientKnownRequestError('Unknown', {
      code: 'P9999',
      clientVersion: '6.0.0',
    });

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
