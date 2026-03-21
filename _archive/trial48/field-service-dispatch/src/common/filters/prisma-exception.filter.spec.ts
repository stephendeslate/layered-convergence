import { describe, it, expect, vi } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { Prisma } from '@prisma/client';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter();

  function createMockHost(mockJson: ReturnType<typeof vi.fn>) {
    const mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: mockJson,
    };
    return {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  }

  it('should handle P2002 unique constraint violation', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '6.0.0',
      meta: { target: ['email'] },
    });

    filter.catch(error, host);

    const response = (host.switchToHttp().getResponse() as any);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        error: 'P2002',
      }),
    );
  });

  it('should handle P2025 record not found', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);
    const error = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: '6.0.0',
    });

    filter.catch(error, host);

    const response = (host.switchToHttp().getResponse() as any);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
      }),
    );
  });

  it('should handle P2003 foreign key violation', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);
    const error = new Prisma.PrismaClientKnownRequestError('FK violation', {
      code: 'P2003',
      clientVersion: '6.0.0',
    });

    filter.catch(error, host);

    const response = (host.switchToHttp().getResponse() as any);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should handle unknown Prisma error codes', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);
    const error = new Prisma.PrismaClientKnownRequestError('Unknown', {
      code: 'P9999',
      clientVersion: '6.0.0',
    });

    filter.catch(error, host);

    const response = (host.switchToHttp().getResponse() as any);
    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should include constraint field in P2002 message', () => {
    const mockJson = vi.fn();
    const host = createMockHost(mockJson);
    const error = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '6.0.0',
      meta: { target: ['email', 'companyId'] },
    });

    filter.catch(error, host);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('email, companyId'),
      }),
    );
  });
});
