import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { HttpStatus } from '@nestjs/common';

const mockJson = vi.fn();
const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
const mockGetResponse = vi.fn().mockReturnValue({ status: mockStatus });
const mockHost = {
  switchToHttp: vi.fn().mockReturnValue({
    getResponse: mockGetResponse,
  }),
};

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    vi.clearAllMocks();
    filter = new PrismaExceptionFilter();
  });

  it('should return 409 for P2002 (unique constraint)', () => {
    const exception = {
      code: 'P2002',
      meta: { target: ['email'] },
      message: 'Unique constraint failed',
      clientVersion: '6.0.0',
    };

    filter.catch(exception as any, mockHost as any);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 409, error: 'P2002' }),
    );
  });

  it('should return 404 for P2025 (record not found)', () => {
    const exception = { code: 'P2025', message: 'Not found', clientVersion: '6.0.0' };

    filter.catch(exception as any, mockHost as any);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, message: 'Record not found' }),
    );
  });

  it('should return 400 for P2003 (foreign key constraint)', () => {
    const exception = { code: 'P2003', message: 'FK failed', clientVersion: '6.0.0' };

    filter.catch(exception as any, mockHost as any);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return 500 for unknown Prisma error codes', () => {
    const exception = { code: 'P9999', message: 'Unknown', clientVersion: '6.0.0' };

    filter.catch(exception as any, mockHost as any);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Database error' }),
    );
  });

  it('should include constraint target in P2002 message', () => {
    const exception = {
      code: 'P2002',
      meta: { target: ['email', 'tenantId'] },
      message: 'Unique constraint',
      clientVersion: '6.0.0',
    };

    filter.catch(exception as any, mockHost as any);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unique constraint violation on email, tenantId' }),
    );
  });
});
