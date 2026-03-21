import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/app/actions';

export async function Nav() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user')?.value;
  let user: { email: string; role: string } | null = null;

  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      user = null;
    }
  }

  return (
    <nav aria-label="Main navigation" className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            Escrow Marketplace
          </Link>
          {user && (
            <>
              <Link
                href="/transactions"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Transactions
              </Link>
              <Link
                href="/disputes"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Disputes
              </Link>
              <Link
                href="/payouts"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Payouts
              </Link>
              <Link
                href="/webhooks"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Webhooks
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.email} ({user.role})
              </span>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
