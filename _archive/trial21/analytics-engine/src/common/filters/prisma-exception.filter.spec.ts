import { describe, it, expect, vi } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { Prisma } from '@prisma/client';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  const createMockHost = () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    return {
      host: {
        switchToHttp: () => ({
          getResponse: () => ({ status }),
          getRequest: () => ({}),
          getNext: vi.fn(),
        }),
        getArgs: vi.fn(),
        getArgByIndex: vi.fn(),
        switchToRpc: vi.fn(),
        switchToWs: vi.fn(),
        getType: vi.fn(),
      } as unknown as ArgumentsHost,
      status,
      json,
    };
  };

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should map P2002 to 409 Conflict', () => {
    const { host, status, json } = createMockHost();
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '6.0.0',
    });
    filter.catch(error, host);
    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 409, error: 'P2002' }),
    );
  });

  it('should map P2025 to 404 Not Found', () => {
    const { host, status, json } = createMockHost();
    const error = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: '6.0.0',
    });
    filter.catch(error, host);
    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, error: 'P2025' }),
    );
  });

  it('should map unknown codes to 500', () => {
    const { host, status, json } = createMockHost();
    const error = new Prisma.PrismaClientKnownRequestError('Unknown', {
      code: 'P9999',
      clientVersion: '6.0.0',
    });
    filter.catch(error, host);
    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500 }),
    );
  });

  it('should include error code in response body', () => {
    const { host, json } = createMockHost();
    const error = new Prisma.PrismaClientKnownRequestError('Conflict', {
      code: 'P2002',
      clientVersion: '6.0.0',
    });
    filter.catch(error, host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'P2002' }),
    );
  });

  it('should include message in response body', () => {
    const { host, json } = createMockHost();
    const error = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: '6.0.0',
    });
    filter.catch(error, host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Record not found' }),
    );
  });

  it('should return proper structure for P2002', () => {
    const { host, json } = createMockHost();
    const error = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '6.0.0',
    });
    filter.catch(error, host);
    expect(json).toHaveBeenCalledWith({
      statusCode: 409,
      message: 'A record with this value already exists',
      error: 'P2002',
    });
  });
});
