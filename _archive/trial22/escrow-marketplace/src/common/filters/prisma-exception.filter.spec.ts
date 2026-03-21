import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { Prisma } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let mockResponse: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
    mockResponse = {
      status: (code: number) => ({
        json: (body: any) => ({ statusCode: code, ...body }),
      }),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    };
  });

  it('should map P2002 to 409 CONFLICT', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002', clientVersion: '6.0.0', meta: { target: ['email'] },
    });

    let capturedStatus = 0;
    let capturedBody: any;
    mockResponse.status = (code: number) => {
      capturedStatus = code;
      return { json: (body: any) => { capturedBody = body; } };
    };

    filter.catch(exception, mockHost);
    expect(capturedStatus).toBe(HttpStatus.CONFLICT);
    expect(capturedBody.error).toBe('P2002');
  });

  it('should map P2025 to 404 NOT_FOUND', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025', clientVersion: '6.0.0',
    });

    let capturedStatus = 0;
    let capturedBody: any;
    mockResponse.status = (code: number) => {
      capturedStatus = code;
      return { json: (body: any) => { capturedBody = body; } };
    };

    filter.catch(exception, mockHost);
    expect(capturedStatus).toBe(HttpStatus.NOT_FOUND);
    expect(capturedBody.message).toBe('Record not found');
  });

  it('should map P2003 to 400 BAD_REQUEST', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('FK constraint', {
      code: 'P2003', clientVersion: '6.0.0',
    });

    let capturedStatus = 0;
    mockResponse.status = (code: number) => {
      capturedStatus = code;
      return { json: () => {} };
    };

    filter.catch(exception, mockHost);
    expect(capturedStatus).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should map unknown codes to 500 INTERNAL_SERVER_ERROR', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unknown', {
      code: 'P9999', clientVersion: '6.0.0',
    });

    let capturedStatus = 0;
    mockResponse.status = (code: number) => {
      capturedStatus = code;
      return { json: () => {} };
    };

    filter.catch(exception, mockHost);
    expect(capturedStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should include target fields in P2002 message', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002', clientVersion: '6.0.0', meta: { target: ['email', 'tenantId'] },
    });

    let capturedBody: any;
    mockResponse.status = () => ({
      json: (body: any) => { capturedBody = body; },
    });

    filter.catch(exception, mockHost);
    expect(capturedBody.message).toContain('email');
    expect(capturedBody.message).toContain('tenantId');
  });
});
