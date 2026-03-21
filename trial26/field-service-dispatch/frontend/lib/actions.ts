// [TRACED:FD-011] Server actions with use server directive
"use server";

// [TRACED:FE-012] Server actions with 'use server' directive (FM #65)
const API_URL = process.env.API_URL || "http://localhost:3001";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  // [TRACED:FE-013] response.ok check before processing
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Login failed");
  }

  const data = await response.json();
  return data;
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Registration failed");
  }

  const data = await response.json();
  return data;
}
