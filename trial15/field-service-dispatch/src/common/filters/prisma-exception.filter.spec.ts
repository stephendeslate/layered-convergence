import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

function createMockHost(): { host: ArgumentsHost; response: { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } } {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const response = { status, json };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({}),
      getNext: () => vi.fn(),
    }),
    getArgs: () => [],
    getArgByIndex: () => ({}),
    switchToRpc: () => ({} as any),
    switchToWs: () => ({} as any),
    getType: () => 'http' as const,
  } as unknown as ArgumentsHost;

  return { host, response };
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
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle P2002 (unique constraint) with 409 Conflict', () => {
    const { host, response } = createMockHost();
    const error = createPrismaError('P2002', { target: ['email', 'companyId'] });

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        error: 'P2002',
      }),
    );
  });

  it('should handle P2025 (not found) with 404', () => {
    const { host, response } = createMockHost();
    const error = createPrismaError('P2025');

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
      }),
    );
  });

  it('should handle P2003 (foreign key) with 400', () => {
    const { host, response } = createMockHost();
    const error = createPrismaError('P2003');

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should handle P2014 (required relation) with 400', () => {
    const { host, response } = createMockHost();
    const error = createPrismaError('P2014');

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should handle unknown Prisma errors with 500', () => {
    const { host, response } = createMockHost();
    const error = createPrismaError('P9999');

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should include error code in response', () => {
    const { host, response } = createMockHost();
    const error = createPrismaError('P2002', { target: ['email'] });

    filter.catch(error, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'P2002' }),
    );
  });

  it('should handle P2002 without meta target gracefully', () => {
    const { host, response } = createMockHost();
    const error = createPrismaError('P2002');

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Unique constraint violation'),
      }),
    );
  });
});
