// [TRACED:UI-011] Register page with role selection (DISPATCHER, TECHNICIAN only)
export default function RegisterPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card)] p-8">
        <h1 className="text-2xl font-bold text-[var(--card-foreground)]">Create Account</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Register for field service dispatch
        </p>
        <form className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-[var(--card-foreground)]">Name</label>
            <input id="name" type="text" required className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-[var(--card-foreground)]">Email</label>
            <input id="email" type="email" required className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-[var(--card-foreground)]">Password</label>
            <input id="password" type="password" required className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="role" className="text-sm font-medium text-[var(--card-foreground)]">Role</label>
            <select id="role" required className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
              <option value="DISPATCHER">Dispatcher</option>
              <option value="TECHNICIAN">Technician</option>
            </select>
          </div>
          <button type="submit" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
