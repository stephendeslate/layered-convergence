import { describe, it, expect, vi } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { Prisma } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  const createMockHost = () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    return {
      switchToHttp: () => ({
        getResponse: () => ({ status } as any),
      }),
      json,
      status,
    };
  };

  it('should return 409 for P2002 (unique constraint)', () => {
    const { status, json, ...host } = createMockHost();
    const error = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      meta: { target: ['email'] },
      clientVersion: '6.0.0',
    });

    filter.catch(error, host as any);
    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 409 }),
    );
  });

  it('should return 404 for P2025 (record not found)', () => {
    const { status, json, ...host } = createMockHost();
    const error = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: '6.0.0',
    });

    filter.catch(error, host as any);
    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('should return 400 for P2003 (foreign key)', () => {
    const { status, json, ...host } = createMockHost();
    const error = new Prisma.PrismaClientKnownRequestError('FK', {
      code: 'P2003',
      clientVersion: '6.0.0',
    });

    filter.catch(error, host as any);
    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return 500 for unknown error codes', () => {
    const { status, json, ...host } = createMockHost();
    const error = new Prisma.PrismaClientKnownRequestError('Unknown', {
      code: 'P9999',
      clientVersion: '6.0.0',
    });

    filter.catch(error, host as any);
    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should include constraint fields in P2002 message', () => {
    const { status, json, ...host } = createMockHost();
    const error = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      meta: { target: ['email', 'companyId'] },
      clientVersion: '6.0.0',
    });

    filter.catch(error, host as any);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('email'),
      }),
    );
  });
});
