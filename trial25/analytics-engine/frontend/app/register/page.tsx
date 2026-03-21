// [TRACED:UI-010] Register page with role selection excluding ADMIN
export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Create Account</h1>
      <form className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)]">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
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
            minLength={8}
            className="mt-1 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-[var(--foreground)]">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="mt-1 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <option value="VIEWER">Viewer</option>
            <option value="EDITOR">Editor</option>
            <option value="ANALYST">Analyst</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
