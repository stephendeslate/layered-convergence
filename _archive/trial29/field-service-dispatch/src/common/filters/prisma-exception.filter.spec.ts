import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

const mockJson = vi.fn();
const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
const mockGetResponse = vi.fn().mockReturnValue({ status: mockStatus });
const mockSwitchToHttp = vi.fn().mockReturnValue({ getResponse: mockGetResponse });
const mockHost = { switchToHttp: mockSwitchToHttp } as any;

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    vi.clearAllMocks();
    filter = new PrismaExceptionFilter();
  });

  it('should handle P2002 (unique constraint) as 409', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      meta: { target: ['email'] },
      clientVersion: '6.0.0',
    });
    filter.catch(exception, mockHost);
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: expect.stringContaining('email'),
      }),
    );
  });

  it('should handle P2025 (not found) as 404', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: '6.0.0',
    });
    filter.catch(exception, mockHost);
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 }),
    );
  });

  it('should handle P2003 (foreign key) as 400', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('FK', {
      code: 'P2003',
      clientVersion: '6.0.0',
    });
    filter.catch(exception, mockHost);
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should handle unknown Prisma error as 500', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unknown', {
      code: 'P9999',
      clientVersion: '6.0.0',
    });
    filter.catch(exception, mockHost);
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should handle P2002 without meta target', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '6.0.0',
    });
    filter.catch(exception, mockHost);
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });
});
