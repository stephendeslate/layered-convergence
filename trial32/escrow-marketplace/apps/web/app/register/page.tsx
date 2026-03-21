import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { registerAction } from '../actions';
import { REGISTERABLE_ROLES } from '@escrow-marketplace/shared';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={registerAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required aria-required="true" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required aria-required="true" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" required aria-required="true">
                {REGISTERABLE_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="tenantId">Tenant ID</Label>
              <Input id="tenantId" name="tenantId" type="text" required aria-required="true" />
            </div>
            <Button type="submit" className="w-full">Register</Button>
            <p className="text-center text-sm text-[var(--muted-foreground)]">
              Have an account? <a href="/login" className="underline">Login</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
