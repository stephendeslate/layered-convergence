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

describe('Tenant Isolation (Integration)', () => {
  let app: INestApplication;
  let tokenOrg1: string;
  let tokenOrg2: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);

    const org1 = await createTestOrg(app, 'org-alpha');
    const org2 = await createTestOrg(app, 'org-beta');

    await createTestUser(app, org1.id, 'user1@alpha.com');
    await createTestUser(app, org2.id, 'user2@beta.com');

    tokenOrg1 = await getAuthToken(app, 'user1@alpha.com');
    tokenOrg2 = await getAuthToken(app, 'user2@beta.com');
  });

  it('should only return pipelines belonging to the user org', async () => {
    await request(app.getHttpServer())
      .post('/pipelines')
      .set('Authorization', `Bearer ${tokenOrg1}`)
      .send({ name: 'Alpha Pipeline' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/pipelines')
      .set('Authorization', `Bearer ${tokenOrg2}`)
      .send({ name: 'Beta Pipeline' })
      .expect(201);

    const res1 = await request(app.getHttpServer())
      .get('/pipelines')
      .set('Authorization', `Bearer ${tokenOrg1}`)
      .expect(200);

    expect(res1.body).toHaveLength(1);
    expect(res1.body[0].name).toBe('Alpha Pipeline');

    const res2 = await request(app.getHttpServer())
      .get('/pipelines')
      .set('Authorization', `Bearer ${tokenOrg2}`)
      .expect(200);

    expect(res2.body).toHaveLength(1);
    expect(res2.body[0].name).toBe('Beta Pipeline');
  });

  it('should only return dashboards belonging to the user org', async () => {
    await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${tokenOrg1}`)
      .send({ name: 'Alpha Dashboard' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/dashboards')
      .set('Authorization', `Bearer ${tokenOrg2}`)
      .send({ name: 'Beta Dashboard' })
      .expect(201);

    const res1 = await request(app.getHttpServer())
      .get('/dashboards')
      .set('Authorization', `Bearer ${tokenOrg1}`)
      .expect(200);

    expect(res1.body).toHaveLength(1);
    expect(res1.body[0].name).toBe('Alpha Dashboard');
  });

  it('should only return data sources belonging to the user org', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set('Authorization', `Bearer ${tokenOrg1}`)
      .send({ name: 'Alpha DS', type: 'api' })
      .expect(201);

    const res2 = await request(app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', `Bearer ${tokenOrg2}`)
      .expect(200);

    expect(res2.body).toHaveLength(0);
  });

  it('should only return users belonging to the user org', async () => {
    const res1 = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${tokenOrg1}`)
      .expect(200);

    expect(res1.body).toHaveLength(1);
    expect(res1.body[0].email).toBe('user1@alpha.com');
  });
});
