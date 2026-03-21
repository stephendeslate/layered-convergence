import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, getStoredToken, setStoredAuth, getStoredUser, clearStoredAuth } from './api';

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('apiFetch', () => {
    it('sends GET request with auth header', async () => {
      const mockResponse = { data: 'test' };
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await apiFetch('/test', { token: 'my-token' });
      expect(result).toEqual(mockResponse);

      const call = vi.mocked(fetch).mock.calls[0];
      expect(call[0]).toContain('/test');
      expect((call[1]?.headers as Record<string, string>)['Authorization']).toBe('Bearer my-token');
    });

    it('sends POST with JSON body', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1' }),
      } as Response);

      await apiFetch('/create', { method: 'POST', body: { name: 'test' } });

      const call = vi.mocked(fetch).mock.calls[0];
      expect(call[1]?.method).toBe('POST');
      expect(call[1]?.body).toBe(JSON.stringify({ name: 'test' }));
    });

    it('throws on non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      } as Response);

      await expect(apiFetch('/auth/login', { method: 'POST', body: {} }))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('localStorage helpers', () => {
    it('stores and retrieves token', () => {
      expect(getStoredToken()).toBeNull();
      setStoredAuth('tok123', 'ref456', { id: '1', email: 'a@b.com', name: 'A', role: 'BUYER' });
      expect(getStoredToken()).toBe('tok123');
    });

    it('stores and retrieves user', () => {
      expect(getStoredUser()).toBeNull();
      setStoredAuth('tok', 'ref', { id: '1', email: 'a@b.com', name: 'Test', role: 'PROVIDER' });
      const user = getStoredUser();
      expect(user).toEqual({ id: '1', email: 'a@b.com', name: 'Test', role: 'PROVIDER' });
    });

    it('clears auth data', () => {
      setStoredAuth('tok', 'ref', { id: '1', email: 'a@b.com', name: 'Test', role: 'BUYER' });
      clearStoredAuth();
      expect(getStoredToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
    });
  });
});
