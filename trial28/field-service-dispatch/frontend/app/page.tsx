import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-[var(--foreground)]">
        Field Service Dispatch
      </h1>
      <p className="mb-12 text-lg text-[var(--muted-foreground)]">
        Manage work orders, dispatch technicians, and track field operations in real time.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create an account to manage your field service operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              Register as a dispatcher, technician, or manager to access work orders,
              routes, and invoicing tools.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Already have an account? Access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              View active work orders, track technician locations, and manage invoices
              from your personalized dashboard.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
