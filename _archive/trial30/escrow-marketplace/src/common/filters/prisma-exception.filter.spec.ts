import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { HttpStatus } from '@nestjs/common';

function createMockHost() {
  const mockJson = (body: any) => body;
  const mockStatus = (code: number) => ({ json: mockJson });

  return {
    switchToHttp: () => ({
      getResponse: () => ({
        status: (code: number) => {
          mockStatus._code = code;
          return { json: (body: any) => ({ ...body, _statusCode: code }) };
        },
      }),
    }),
    _statusCode: 0,
  };
}

function createPrismaError(code: string, meta?: Record<string, any>) {
  const error = new Error(`Prisma error ${code}`) as any;
  error.code = code;
  error.meta = meta;
  error.clientVersion = '6.0.0';
  // Simulate PrismaClientKnownRequestError structure
  Object.defineProperty(error, 'name', { value: 'PrismaClientKnownRequestError' });
  return error;
}

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let responseBody: any;
  let responseStatus: number;

  function createHost() {
    return {
      switchToHttp: () => ({
        getResponse: () => ({
          status: (code: number) => {
            responseStatus = code;
            return {
              json: (body: any) => {
                responseBody = body;
              },
            };
          },
        }),
      }),
    };
  }

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
    responseBody = null;
    responseStatus = 0;
  });

  it('should return 409 for P2002 (unique constraint)', () => {
    const error = createPrismaError('P2002', { target: ['email'] });
    filter.catch(error, createHost() as any);

    expect(responseStatus).toBe(HttpStatus.CONFLICT);
    expect(responseBody.message).toContain('email');
    expect(responseBody.error).toBe('P2002');
  });

  it('should return 404 for P2025 (record not found)', () => {
    const error = createPrismaError('P2025');
    filter.catch(error, createHost() as any);

    expect(responseStatus).toBe(HttpStatus.NOT_FOUND);
    expect(responseBody.message).toBe('Record not found');
    expect(responseBody.error).toBe('P2025');
  });

  it('should return 400 for P2003 (foreign key constraint)', () => {
    const error = createPrismaError('P2003');
    filter.catch(error, createHost() as any);

    expect(responseStatus).toBe(HttpStatus.BAD_REQUEST);
    expect(responseBody.message).toBe('Foreign key constraint violation');
    expect(responseBody.error).toBe('P2003');
  });

  it('should return 500 for unknown Prisma error codes', () => {
    const error = createPrismaError('P9999');
    filter.catch(error, createHost() as any);

    expect(responseStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(responseBody.message).toBe('Database error');
    expect(responseBody.error).toBe('P9999');
  });

  it('should include target fields in P2002 message', () => {
    const error = createPrismaError('P2002', { target: ['email', 'tenantId'] });
    filter.catch(error, createHost() as any);

    expect(responseBody.message).toContain('email, tenantId');
  });

  it('should use fallback when P2002 has no target meta', () => {
    const error = createPrismaError('P2002', {});
    filter.catch(error, createHost() as any);

    expect(responseBody.message).toContain('field');
  });
});
