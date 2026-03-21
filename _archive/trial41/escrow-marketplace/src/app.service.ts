import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      name: 'Escrow Marketplace API',
      version: '0.1.0',
      description:
        'Demo application — no real funds are processed',
      timestamp: new Date().toISOString(),
    };
  }
}
