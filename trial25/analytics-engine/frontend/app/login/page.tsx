// [TRACED:UI-009] Login page with form using shadcn/ui components
export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Sign In</h1>
      <form className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
