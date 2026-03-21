import { describe, it, expect, beforeEach } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

function createMockHost(responseMock: { status: ReturnType<typeof vi.fn> }) {
  return {
    switchToHttp: () => ({
      getResponse: () => responseMock,
      getRequest: () => ({}),
      getNext: () => vi.fn(),
    }),
    getArgs: () => [],
    getArgByIndex: () => null,
    switchToRpc: () => ({ getContext: vi.fn(), getData: vi.fn() }),
    switchToWs: () => ({ getClient: vi.fn(), getData: vi.fn(), getPattern: vi.fn() }),
    getType: () => 'http',
  } as any;
}

function createPrismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('Test error', {
    code,
    clientVersion: '6.0.0',
  });
}

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should map P2002 to 409 CONFLICT', () => {
    const error = createPrismaError('P2002');
    const host = createMockHost({ status: statusMock });
    filter.catch(error, host);
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        error: 'P2002',
      }),
    );
  });

  it('should map P2025 to 404 NOT_FOUND', () => {
    const error = createPrismaError('P2025');
    const host = createMockHost({ status: statusMock });
    filter.catch(error, host);
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'P2025',
      }),
    );
  });

  it('should map unknown codes to 500 INTERNAL_SERVER_ERROR', () => {
    const error = createPrismaError('P9999');
    const host = createMockHost({ status: statusMock });
    filter.catch(error, host);
    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should include error code in response body', () => {
    const error = createPrismaError('P2002');
    const host = createMockHost({ status: statusMock });
    filter.catch(error, host);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'P2002' }),
    );
  });

  it('should include message in response body', () => {
    const error = createPrismaError('P2025');
    const host = createMockHost({ status: statusMock });
    filter.catch(error, host);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Record not found' }),
    );
  });
});
