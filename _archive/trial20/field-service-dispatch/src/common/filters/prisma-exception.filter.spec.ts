import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma-exception.filter.js';

const makeHost = () => {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const response = { status };
  return {
    host: {
      switchToHttp: () => ({ getResponse: () => response }),
    } as unknown as ArgumentsHost,
    status,
    json,
  };
};

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    vi.clearAllMocks();
    filter = new PrismaExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('HttpException passthrough', () => {
    it('should pass through HttpException with object response', () => {
      const { host, status, json } = makeHost();
      const exception = new HttpException(
        { statusCode: 400, message: 'Bad request' },
        400,
      );

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'Bad request',
      });
    });

    it('should pass through HttpException with string response', () => {
      const { host, status, json } = makeHost();
      const exception = new HttpException('Not found', 404);

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({
        statusCode: 404,
        message: 'Not found',
      });
    });
  });

  describe('Prisma errors', () => {
    it('should handle P2002 as 409 Conflict', () => {
      const { host, status, json } = makeHost();
      const exception = { code: 'P2002', message: 'Unique constraint' };

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        message: 'A record with this value already exists',
        error: 'P2002',
      });
    });

    it('should handle P2025 as 404 Not Found', () => {
      const { host, status, json } = makeHost();
      const exception = { code: 'P2025', message: 'Record not found' };

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
        error: 'P2025',
      });
    });

    it('should handle P2003 as 400 Bad Request', () => {
      const { host, status, json } = makeHost();
      const exception = { code: 'P2003', message: 'FK failed' };

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Foreign key constraint failed',
        error: 'P2003',
      });
    });

    it('should handle unknown Prisma error as 500', () => {
      const { host, status, json } = makeHost();
      const exception = { code: 'P9999', message: 'Unknown' };

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'P9999',
      });
    });
  });

  describe('Unknown errors', () => {
    it('should handle non-Prisma non-Http errors as 500', () => {
      const { host, status, json } = makeHost();
      const exception = new Error('Something broke');

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    });

    it('should handle null/undefined exception as 500', () => {
      const { host, status, json } = makeHost();

      filter.catch(null, host);

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
