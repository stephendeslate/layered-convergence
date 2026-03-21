import { describe, it, expect } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { Prisma } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

function createMockHost(responseMock: any) {
  return {
    switchToHttp: () => ({
      getResponse: () => responseMock,
      getRequest: () => ({}),
    }),
  } as any;
}

function createPrismaError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Error', {
    code,
    clientVersion: '6.0.0',
  });
}

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  it('should map P2002 to 409 Conflict', () => {
    let captured: any;
    const res = {
      status: (code: number) => {
        captured = { statusCode: code };
        return { json: (body: any) => { captured.body = body; } };
      },
    };
    filter.catch(createPrismaError('P2002'), createMockHost(res));
    expect(captured.statusCode).toBe(HttpStatus.CONFLICT);
    expect(captured.body.error).toBe('P2002');
  });

  it('should map P2025 to 404 Not Found', () => {
    let captured: any;
    const res = {
      status: (code: number) => {
        captured = { statusCode: code };
        return { json: (body: any) => { captured.body = body; } };
      },
    };
    filter.catch(createPrismaError('P2025'), createMockHost(res));
    expect(captured.statusCode).toBe(HttpStatus.NOT_FOUND);
  });

  it('should map P2003 to 400 Bad Request', () => {
    let captured: any;
    const res = {
      status: (code: number) => {
        captured = { statusCode: code };
        return { json: (body: any) => { captured.body = body; } };
      },
    };
    filter.catch(createPrismaError('P2003'), createMockHost(res));
    expect(captured.statusCode).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should map P2014 to 400 Bad Request', () => {
    let captured: any;
    const res = {
      status: (code: number) => {
        captured = { statusCode: code };
        return { json: (body: any) => { captured.body = body; } };
      },
    };
    filter.catch(createPrismaError('P2014'), createMockHost(res));
    expect(captured.statusCode).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should map unknown codes to 500', () => {
    let captured: any;
    const res = {
      status: (code: number) => {
        captured = { statusCode: code };
        return { json: (body: any) => { captured.body = body; } };
      },
    };
    filter.catch(createPrismaError('P9999'), createMockHost(res));
    expect(captured.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should include error code in response body', () => {
    let captured: any;
    const res = {
      status: () => ({ json: (body: any) => { captured = body; } }),
    };
    filter.catch(createPrismaError('P2002'), createMockHost(res));
    expect(captured.error).toBe('P2002');
  });

  it('should include message in response body for P2025', () => {
    let captured: any;
    const res = {
      status: () => ({ json: (body: any) => { captured = body; } }),
    };
    filter.catch(createPrismaError('P2025'), createMockHost(res));
    expect(captured.message).toBe('Record not found');
  });
});
