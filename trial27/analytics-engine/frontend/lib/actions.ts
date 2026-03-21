// [TRACED:AE-011] Server Actions with 'use server' and response.ok checks
"use server";

const API_BASE = process.env.API_URL || "http://localhost:3001";

export async function loginAction(formData: FormData) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Login failed" };
  }

  return response.json();
}

export async function registerAction(formData: FormData) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      role: formData.get("role"),
      tenantId: formData.get("tenantId"),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Registration failed" };
  }

  return response.json();
}

export async function fetchDashboards(token: string) {
  const response = await fetch(`${API_BASE}/analytics/dashboards`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Failed to fetch dashboards" };
  }

  return response.json();
}
