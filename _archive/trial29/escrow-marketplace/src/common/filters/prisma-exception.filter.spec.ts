import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { HttpStatus } from '@nestjs/common';

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let mockResponse: any;
  let mockHost: any;

  beforeEach(() => {
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    };
    filter = new PrismaExceptionFilter();
  });

  it('should return 409 for P2002 (unique constraint)', () => {
    const exception = { code: 'P2002', meta: { target: ['email'] }, message: '', clientVersion: '6.0.0' };

    filter.catch(exception as any, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        error: 'P2002',
      }),
    );
  });

  it('should return 404 for P2025 (record not found)', () => {
    const exception = { code: 'P2025', message: '', clientVersion: '6.0.0' };

    filter.catch(exception as any, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
        error: 'P2025',
      }),
    );
  });

  it('should return 400 for P2003 (foreign key constraint)', () => {
    const exception = { code: 'P2003', message: '', clientVersion: '6.0.0' };

    filter.catch(exception as any, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Foreign key constraint violation',
      }),
    );
  });

  it('should return 500 for unknown Prisma errors', () => {
    const exception = { code: 'P9999', message: '', clientVersion: '6.0.0' };

    filter.catch(exception as any, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database error',
      }),
    );
  });

  it('should include target fields in P2002 message', () => {
    const exception = { code: 'P2002', meta: { target: ['email', 'tenantId'] }, message: '', clientVersion: '6.0.0' };

    filter.catch(exception as any, mockHost as any);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unique constraint violation on email, tenantId',
      }),
    );
  });

  it('should use fallback when P2002 has no target', () => {
    const exception = { code: 'P2002', meta: {}, message: '', clientVersion: '6.0.0' };

    filter.catch(exception as any, mockHost as any);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unique constraint violation on field',
      }),
    );
  });
});
