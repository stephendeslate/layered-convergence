import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let mockResponse: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as any;
  });

  it('should handle P2002 with 409 Conflict', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      meta: { target: ['email'] },
      clientVersion: '6.0.0',
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        error: 'P2002',
      }),
    );
  });

  it('should handle P2025 with 404 Not Found', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      meta: {},
      clientVersion: '6.0.0',
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Record not found',
      }),
    );
  });

  it('should handle unknown codes with 500', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unknown error', {
      code: 'P2003',
      meta: {},
      clientVersion: '6.0.0',
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should include the Prisma error code in response', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Error', {
      code: 'P2002',
      meta: { target: ['slug'] },
      clientVersion: '6.0.0',
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'P2002' }),
    );
  });

  it('should include target fields in P2002 message', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Error', {
      code: 'P2002',
      meta: { target: ['email', 'organizationId'] },
      clientVersion: '6.0.0',
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('email'),
      }),
    );
  });
});
