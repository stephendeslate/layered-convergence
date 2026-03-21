// [TRACED:FD-038] Register page with shadcn Select for role (NOT raw <select>)
"use client";

import { useState } from "react";
import { registerUser } from "../../lib/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("DISPATCHER");

  async function handleSubmit(formData: FormData) {
    formData.set("role", role);
    const result = await registerUser(formData);
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
        Create Account
      </h1>
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md bg-[var(--destructive)] p-3 text-[var(--destructive-foreground)]"
        >
          {error}
        </div>
      )}
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-[var(--foreground)]"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)]"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-[var(--foreground)]"
          >
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
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-[var(--foreground)]"
          >
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
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Role
          </label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DISPATCHER">Dispatcher</SelectItem>
              <SelectItem value="TECHNICIAN">Technician</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="companyId"
            className="mb-1 block text-sm font-medium text-[var(--foreground)]"
          >
            Company ID
          </label>
          <input
            id="companyId"
            name="companyId"
            type="text"
            required
            className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-[var(--ring)]"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-[var(--primary-foreground)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
