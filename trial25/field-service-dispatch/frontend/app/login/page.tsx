// [TRACED:UI-010] Login page with form
export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card)] p-8">
        <h1 className="text-2xl font-bold text-[var(--card-foreground)]">Sign In</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Access your field service dashboard
        </p>
        <form className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-[var(--card-foreground)]">Email</label>
            <input id="email" type="email" required className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-[var(--card-foreground)]">Password</label>
            <input id="password" type="password" required className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
