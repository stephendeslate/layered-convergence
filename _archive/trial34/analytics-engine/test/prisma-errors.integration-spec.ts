import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  cleanDatabase,
  createTestOrg,
  createTestUser,
  getAuthToken,
} from './helpers';

describe('Prisma Error Handling (Integration)', () => {
  let app: INestApplication;
  let token: string;
  let orgId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
    const org = await createTestOrg(app);
    orgId = org.id;
    await createTestUser(app, org.id);
    token = await getAuthToken(app);
  });

  it('should return 409 on duplicate organization slug (P2002)', async () => {
    const res = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicate', slug: 'test-org' })
      .expect(409);

    expect(res.body.error).toBe('P2002');
  });

  it('should return 409 on duplicate user email (P2002)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password1',
        organizationId: orgId,
      })
      .expect(409);

    expect(res.body.error).toBe('P2002');
  });

  it('should return 404 when updating non-existent pipeline (P2025)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app.getHttpServer())
      .patch(`/pipelines/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated' })
      .expect(404);

    expect(res.body.error).toBe('P2025');
  });

  it('should return 404 when deleting non-existent dashboard (P2025)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .delete(`/dashboards/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('should return 404 when deleting non-existent user (P2025)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .delete(`/users/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
