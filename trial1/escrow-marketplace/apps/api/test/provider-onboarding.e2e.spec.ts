/**
 * E2E tests — Provider onboarding flow.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createTestApp,
  closeTestApp,
  cleanDatabase,
  registerUser,
  TestApp,
} from './setup';

describe('Provider Onboarding E2E', () => {
  let t: TestApp;
  let providerToken: string;
  let providerId: string;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase(t.prisma);

    const provider = await registerUser(t.request, {
      email: 'provider-onboard@e2e.test',
      password: 'ProviderPass123',
      displayName: 'Onboard Provider',
      role: 'PROVIDER',
    });
    providerToken = provider.tokens.accessToken;
    providerId = provider.user.id;
  });

  describe('GET /api/v1/providers/status', () => {
    it('should return NOT_STARTED for new provider', async () => {
      const res = await t.request
        .get('/api/v1/providers/status')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(res.body.onboardingStatus).toBe('NOT_STARTED');
      expect(res.body.chargesEnabled).toBe(false);
      expect(res.body.payoutsEnabled).toBe(false);
    });
  });

  describe('POST /api/v1/providers/onboard', () => {
    it('should initiate onboarding and return a URL', async () => {
      const res = await t.request
        .post('/api/v1/providers/onboard')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(201);

      expect(res.body.url).toBeTruthy();
      // In mock mode, URL should contain stripe.com/setup/mock
      expect(res.body.url).toContain('stripe.com');

      // Status should now be PENDING
      const statusRes = await t.request
        .get('/api/v1/providers/status')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(statusRes.body.onboardingStatus).toBe('PENDING');
    });

    it('should reject onboarding if already complete', async () => {
      // Directly mark as complete
      await t.prisma.stripeConnectedAccount.create({
        data: {
          userId: providerId,
          stripeAccountId: `acct_test_complete_${Date.now()}`,
          onboardingStatus: 'COMPLETE',
          chargesEnabled: true,
          payoutsEnabled: true,
          detailsSubmitted: true,
        },
      });

      await t.request
        .post('/api/v1/providers/onboard')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(400);
    });
  });

  describe('POST /api/v1/providers/onboard/refresh', () => {
    it('should refresh onboarding link for existing account', async () => {
      // Initiate first
      await t.request
        .post('/api/v1/providers/onboard')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(201);

      // Refresh
      const res = await t.request
        .post('/api/v1/providers/onboard/refresh')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(res.body.url).toBeTruthy();
    });

    it('should fail if no account exists', async () => {
      await t.request
        .post('/api/v1/providers/onboard/refresh')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/providers/dashboard', () => {
    it('should return dashboard metrics for provider', async () => {
      const res = await t.request
        .get('/api/v1/providers/dashboard')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalEarnedCents');
      expect(res.body).toHaveProperty('pendingReleaseCents');
      expect(res.body).toHaveProperty('availablePayoutCents');
      expect(res.body.totalEarnedCents).toBe(0);
    });
  });
});
