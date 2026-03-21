import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { loginAction } from '../actions';

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required aria-required="true" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required aria-required="true" />
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
            <p className="text-center text-sm text-[var(--muted-foreground)]">
              No account? <a href="/register" className="underline">Register</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
