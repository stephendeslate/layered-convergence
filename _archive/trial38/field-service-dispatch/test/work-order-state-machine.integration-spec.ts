import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import {
  getTestPrisma,
  cleanDatabase,
  teardown,
  createTestCompany,
  createTestUser,
  createTestCustomer,
  createTestTechnician,
  createTestWorkOrder,
} from './helpers';

describe('Work Order State Machine (Integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
    await teardown();
  });

  beforeEach(async () => {
    await cleanDatabase();
    const company = await createTestCompany();
    companyId = company.id;
    const user = await createTestUser(companyId);
    const customer = await createTestCustomer(companyId);
    customerId = customer.id;
    const technician = await createTestTechnician(companyId);
    technicianId = technician.id;
    token = await jwtService.signAsync({
      sub: user.id,
      email: user.email,
      companyId,
    });
  });

  it('should transition through the full lifecycle', async () => {
    const prisma = getTestPrisma();

    const wo = await createTestWorkOrder(companyId, customerId, {
      technicianId,
      status: 'ASSIGNED',
    });

    const transitions = [
      'EN_ROUTE',
      'ON_SITE',
      'IN_PROGRESS',
      'COMPLETED',
      'INVOICED',
      'PAID',
    ];

    for (const status of transitions) {
      const res = await request(app.getHttpServer())
        .patch(`/work-orders/${wo.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status })
        .expect(200);

      expect(res.body.status).toBe(status);
    }

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
      orderBy: { createdAt: 'asc' },
    });

    expect(history).toHaveLength(6);
    expect(history[0].fromStatus).toBe('ASSIGNED');
    expect(history[0].toStatus).toBe('EN_ROUTE');
    expect(history[history.length - 1].toStatus).toBe('PAID');
  });

  it('should reject invalid state transitions', async () => {
    const wo = await createTestWorkOrder(companyId, customerId);

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should allow backward transition EN_ROUTE -> ASSIGNED', async () => {
    const wo = await createTestWorkOrder(companyId, customerId, {
      technicianId,
      status: 'EN_ROUTE',
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ASSIGNED' })
      .expect(200);

    expect(res.body.status).toBe('ASSIGNED');
  });

  it('should set completedAt when transitioning to COMPLETED', async () => {
    const wo = await createTestWorkOrder(companyId, customerId, {
      technicianId,
      status: 'IN_PROGRESS',
    });

    const res = await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETED' })
      .expect(200);

    expect(res.body.completedAt).not.toBeNull();
  });

  it('should record status history with note', async () => {
    const prisma = getTestPrisma();
    const wo = await createTestWorkOrder(companyId, customerId, {
      status: 'UNASSIGNED',
      technicianId,
    });

    await request(app.getHttpServer())
      .patch(`/work-orders/${wo.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ASSIGNED', note: 'Assigning to team' })
      .expect(200);

    const history = await prisma.workOrderStatusHistory.findMany({
      where: { workOrderId: wo.id },
    });

    expect(history).toHaveLength(1);
    expect(history[0].note).toBe('Assigning to team');
  });
});
