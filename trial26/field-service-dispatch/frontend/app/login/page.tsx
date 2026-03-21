// [TRACED:FD-041] Login with shadcn Input and Label
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/actions";

// [TRACED:FE-007] Login page
export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required aria-required="true" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required aria-required="true" />
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
