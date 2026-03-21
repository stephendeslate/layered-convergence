import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { registerAction } from '@/app/actions';
import { REGISTERABLE_ROLES } from '@field-service-dispatch/shared';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <form action={registerAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required aria-required="true" placeholder="user@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required aria-required="true" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" required aria-required="true">
                {REGISTERABLE_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyId">Company ID</Label>
              <Input id="companyId" name="companyId" type="text" required aria-required="true" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Create Account</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
