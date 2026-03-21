"use client";

import { useState } from "react";
import { loginUser } from "../../lib/actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await loginUser(formData);
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">Sign In</h1>
      {error && (
        <div role="alert" className="mb-4 rounded-md bg-[var(--destructive)] p-3 text-[var(--destructive-foreground)]">
          {error}
        </div>
      )}
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)]"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)]"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-[var(--primary-foreground)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
