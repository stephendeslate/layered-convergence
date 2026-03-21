// Integration tests for GpsEventService — REAL database, NO Prisma mocking

import { Test, TestingModule } from '@nestjs/testing';
import { GpsEventModule } from '../src/gps-event/gps-event.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { GpsEventService } from '../src/gps-event/gps-event.service';

describe('GpsEventService Integration', () => {
  let module: TestingModule;
  let gpsEventService: GpsEventService;
  let prisma: PrismaService;
  let companyId: string;
  let technicianId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [GpsEventModule, PrismaModule],
    }).compile();

    gpsEventService = module.get<GpsEventService>(GpsEventService);
    prisma = module.get<PrismaService>(PrismaService);

    const company = await prisma.company.create({
      data: { name: 'GPS Test Company' },
    });
    companyId = company.id;

    const technician = await prisma.technician.create({
      data: {
        name: 'GPS Test Tech',
        companyId,
      },
    });
    technicianId = technician.id;
  });

  afterAll(async () => {
    await prisma.gpsEvent.deleteMany({ where: { companyId } });
    await prisma.technician.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({ where: { id: companyId } });
    await module.close();
  });

  it('should create a GPS event', async () => {
    const event = await gpsEventService.create(
      {
        latitude: 40.7128,
        longitude: -74.006,
        technicianId,
      },
      companyId,
    );

    expect(event).toBeDefined();
    expect(event.latitude).toBeCloseTo(40.7128, 4);
    expect(event.longitude).toBeCloseTo(-74.006, 3);
    expect(event.technicianId).toBe(technicianId);
    expect(event.companyId).toBe(companyId);
  });

  it('should find GPS events by technician', async () => {
    // Create multiple events
    await gpsEventService.create(
      { latitude: 40.7129, longitude: -74.007, technicianId },
      companyId,
    );
    await gpsEventService.create(
      { latitude: 40.713, longitude: -74.008, technicianId },
      companyId,
    );

    const events = await gpsEventService.findByTechnician(technicianId, companyId);

    expect(events.length).toBeGreaterThanOrEqual(2);
    for (const event of events) {
      expect(event.technicianId).toBe(technicianId);
      expect(event.companyId).toBe(companyId);
    }
  });

  it('should return events ordered by timestamp descending', async () => {
    const events = await gpsEventService.findByTechnician(technicianId, companyId);

    for (let i = 1; i < events.length; i++) {
      const prev = new Date(events[i - 1].timestamp).getTime();
      const curr = new Date(events[i].timestamp).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });
});
