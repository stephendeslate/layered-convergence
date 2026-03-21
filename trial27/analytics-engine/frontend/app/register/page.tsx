// [TRACED:AE-038] Register page uses shadcn Select (NOT raw <select>)
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { registerAction } from "../../lib/actions";

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={registerAction} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select name="role" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="ANALYST">Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tenantId">Tenant ID</Label>
              <Input id="tenantId" name="tenantId" type="text" required />
            </div>
            <Button type="submit" className="w-full">
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
