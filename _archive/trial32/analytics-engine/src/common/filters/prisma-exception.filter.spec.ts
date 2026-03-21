import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';
import { HttpStatus } from '@nestjs/common';

const mockResponse = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
};

const mockHost = {
  switchToHttp: () => ({
    getResponse: () => mockResponse,
  }),
};

class MockPrismaClientKnownRequestError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'PrismaClientKnownRequestError';
  }
}

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    vi.clearAllMocks();
    filter = new PrismaExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should return 409 for P2002 (unique constraint)', () => {
    const exception = new MockPrismaClientKnownRequestError(
      'Unique constraint',
      'P2002',
    );
    filter.catch(exception as any, mockHost as any);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'A record with this value already exists',
    });
  });

  it('should return 404 for P2025 (not found)', () => {
    const exception = new MockPrismaClientKnownRequestError(
      'Not found',
      'P2025',
    );
    filter.catch(exception as any, mockHost as any);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Record not found',
    });
  });

  it('should return 400 for P2003 (foreign key constraint)', () => {
    const exception = new MockPrismaClientKnownRequestError(
      'FK failed',
      'P2003',
    );
    filter.catch(exception as any, mockHost as any);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Foreign key constraint failed',
    });
  });

  it('should return 500 for unknown Prisma error codes', () => {
    const exception = new MockPrismaClientKnownRequestError(
      'Unknown',
      'P9999',
    );
    filter.catch(exception as any, mockHost as any);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
});
