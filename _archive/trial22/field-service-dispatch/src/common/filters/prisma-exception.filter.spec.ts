import { describe, it, expect, vi } from 'vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  function createHost(responseMock: any) {
    return {
      switchToHttp: () => ({
        getResponse: () => responseMock,
        getRequest: () => ({}),
      }),
    } as any;
  }

  function createResponse() {
    const res = {
      statusCode: 0,
      body: null as any,
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    return res;
  }

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException', () => {
    const res = createResponse();
    const host = createHost(res);
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should handle HttpException with object response', () => {
    const res = createResponse();
    const host = createHost(res);
    const exception = new HttpException({ statusCode: 400, message: 'Validation failed' }, 400);

    filter.catch(exception, host);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ statusCode: 400, message: 'Validation failed' });
  });

  it('should handle HttpException with string response', () => {
    const res = createResponse();
    const host = createHost(res);
    const exception = new HttpException('Not Found', 404);

    filter.catch(exception, host);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ statusCode: 404, message: 'Not Found' });
  });

  it('should handle P2002 (unique constraint) as 409 Conflict', () => {
    const res = createResponse();
    const host = createHost(res);
    const exception = { code: 'P2002', message: 'Unique constraint', meta: {} };

    filter.catch(exception, host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 409, error: 'P2002' }),
    );
  });

  it('should handle P2025 (record not found) as 404', () => {
    const res = createResponse();
    const host = createHost(res);
    const exception = { code: 'P2025', message: 'Record not found' };

    filter.catch(exception, host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, error: 'P2025' }),
    );
  });

  it('should handle P2003 (foreign key) as 400', () => {
    const res = createResponse();
    const host = createHost(res);
    const exception = { code: 'P2003', message: 'Foreign key constraint failed' };

    filter.catch(exception, host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, error: 'P2003' }),
    );
  });

  it('should handle unknown Prisma error as 500', () => {
    const res = createResponse();
    const host = createHost(res);
    const exception = { code: 'P9999', message: 'Unknown Prisma error' };

    filter.catch(exception, host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should handle generic unknown errors as 500', () => {
    const res = createResponse();
    const host = createHost(res);

    filter.catch(new Error('Something broke'), host);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500, message: 'Internal server error' }),
    );
  });

  it('should handle null exception as 500', () => {
    const res = createResponse();
    const host = createHost(res);

    filter.catch(null, host);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
