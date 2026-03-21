import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return health with status ok', () => {
    const result = service.getHealth();
    expect(result.status).toBe('ok');
  });

  it('should return health with ISO timestamp', () => {
    const result = service.getHealth();
    expect(() => new Date(result.timestamp)).not.toThrow();
  });
});
