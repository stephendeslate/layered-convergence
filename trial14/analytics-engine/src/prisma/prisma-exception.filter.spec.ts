import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let mockResponse: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as any;
    filter = new PrismaExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should map P2002 to 409 Conflict', () => {
    const exception = { code: 'P2002', message: 'Unique constraint failed' } as any;
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 409,
      message: 'A record with this value already exists',
      error: 'P2002',
    });
  });

  it('should map P2025 to 404 Not Found', () => {
    const exception = { code: 'P2025', message: 'Record not found' } as any;
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Record not found',
      error: 'P2025',
    });
  });

  it('should map unknown codes to 500 Internal Server Error', () => {
    const exception = { code: 'P9999', message: 'Unknown error' } as any;
    filter.catch(exception, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      error: 'P9999',
    });
  });
});
