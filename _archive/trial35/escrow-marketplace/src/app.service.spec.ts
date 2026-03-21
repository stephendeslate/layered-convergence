import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatus', () => {
    it('should return status object with correct name', () => {
      const result = service.getStatus();
      expect(result.name).toBe('Escrow Marketplace API');
    });

    it('should return status object with version', () => {
      const result = service.getStatus();
      expect(result.version).toBe('0.1.0');
    });

    it('should return status object with description', () => {
      const result = service.getStatus();
      expect(result.description).toContain('Demo');
    });

    it('should return ISO timestamp', () => {
      const result = service.getStatus();
      expect(() => new Date(result.timestamp)).not.toThrow();
    });
  });
});
