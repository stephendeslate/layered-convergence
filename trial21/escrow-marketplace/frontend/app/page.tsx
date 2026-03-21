import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// [TRACED:PV-002] Landing page presenting the escrow marketplace value proposition
export default function HomePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Escrow Marketplace</CardTitle>
          <CardDescription>
            Secure escrow transactions between buyers and sellers
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
