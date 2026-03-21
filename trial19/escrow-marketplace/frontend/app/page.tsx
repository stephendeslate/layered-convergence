import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Escrow Marketplace</h1>
        <p className="text-xl text-muted-foreground">
          Secure escrow transactions between buyers and sellers
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 max-w-2xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>New User?</CardTitle>
            <CardDescription>Create an account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/register">Register</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Existing User?</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
