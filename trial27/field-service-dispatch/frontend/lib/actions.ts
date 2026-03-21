// [TRACED:FD-011] Server Actions with response.ok validation
"use server";

const API_BASE = process.env.API_URL || "http://localhost:3000";

export async function registerUser(formData: FormData) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      role: formData.get("role"),
      companyId: formData.get("companyId"),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Registration failed" };
  }

  return response.json();
}

export async function loginUser(formData: FormData) {
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

export async function fetchWorkOrders(token: string) {
  const response = await fetch(`${API_BASE}/work-orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return { error: "Failed to fetch work orders" };
  }

  return response.json();
}

export async function transitionWorkOrder(
  workOrderId: string,
  status: string,
  token: string,
) {
  const response = await fetch(
    `${API_BASE}/work-orders/${workOrderId}/transition`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || "Transition failed" };
  }

  return response.json();
}
