import { PrismaExceptionFilter } from './prisma-exception.filter.js';
import { Prisma } from '../../../generated/prisma/client.js';
const PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let mockResponse: { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
        getNext: () => vi.fn(),
      }),
      getArgs: () => [],
      getArgByIndex: () => ({}),
      switchToRpc: () => ({}) as any,
      switchToWs: () => ({}) as any,
      getType: () => 'http',
    } as unknown as ArgumentsHost;
  });

  it('should return 409 for P2002 (unique constraint)', () => {
    const error = new PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });
    filter.catch(error, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return 404 for P2025 (not found)', () => {
    const error = new PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: '5.0.0',
    });
    filter.catch(error, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('should return 400 for P2003 (foreign key)', () => {
    const error = new PrismaClientKnownRequestError('FK failed', {
      code: 'P2003',
      clientVersion: '5.0.0',
    });
    filter.catch(error, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return 500 for unknown codes', () => {
    const error = new PrismaClientKnownRequestError('Unknown', {
      code: 'P9999',
      clientVersion: '5.0.0',
    });
    filter.catch(error, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });
});
