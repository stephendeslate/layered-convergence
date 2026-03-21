import { cookies } from 'next/headers';
import type { User } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export { API_URL };

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

// [TRACED:UI-003] Safe cookie parsing with runtime type narrowing (no `as any`)
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user')?.value;
  if (!userCookie) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(userCookie);
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'id' in parsed &&
      'email' in parsed &&
      'role' in parsed &&
      'companyId' in parsed
    ) {
      const user = parsed as Record<string, unknown>;
      if (
        typeof user.id === 'string' &&
        typeof user.email === 'string' &&
        typeof user.role === 'string' &&
        typeof user.companyId === 'string'
      ) {
        return {
          id: user.id,
          email: user.email,
          role: user.role as User['role'],
          companyId: user.companyId,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });
}
