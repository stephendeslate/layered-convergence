import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';

const createMockHost = () => {
  const mockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
    }),
    mockResponse,
  };
};

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should pass through HttpException', () => {
    const { mockResponse, ...host } = createMockHost();
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    filter.catch(exception, host as any);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('should map P2002 to 409 Conflict', () => {
    const { mockResponse, ...host } = createMockHost();
    const exception = { code: 'P2002', message: 'Unique constraint', meta: {} };
    filter.catch(exception, host as any);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: HttpStatus.CONFLICT,
      error: 'P2002',
    }));
  });

  it('should map P2025 to 404 Not Found', () => {
    const { mockResponse, ...host } = createMockHost();
    const exception = { code: 'P2025', message: 'Record not found', meta: {} };
    filter.catch(exception, host as any);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: HttpStatus.NOT_FOUND,
      error: 'P2025',
    }));
  });

  it('should map P2003 to 400 Bad Request', () => {
    const { mockResponse, ...host } = createMockHost();
    const exception = { code: 'P2003', message: 'Foreign key', meta: {} };
    filter.catch(exception, host as any);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'P2003',
    }));
  });

  it('should map unknown Prisma error to 500', () => {
    const { mockResponse, ...host } = createMockHost();
    const exception = { code: 'P9999', message: 'Unknown', meta: {} };
    filter.catch(exception, host as any);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should handle non-Prisma non-Http exceptions as 500', () => {
    const { mockResponse, ...host } = createMockHost();
    const exception = new Error('Something broke');
    filter.catch(exception, host as any);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    }));
  });

  it('should handle HttpException with object response', () => {
    const { mockResponse, ...host } = createMockHost();
    const exception = new HttpException({ statusCode: 400, message: 'Bad', error: 'Bad Request' }, 400);
    filter.catch(exception, host as any);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });
});
