// [TRACED:EM-039] Register with shadcn Select (FM #71)
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { register } from "@/lib/actions";

// [TRACED:FE-010] Register page using shadcn Select (FM #71)
export default function RegisterPage() {
  const [role, setRole] = useState("");

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={register} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" required aria-required="true" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required aria-required="true" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required aria-required="true" />
            </div>
            <div>
              <Label htmlFor="role-select">Role</Label>
              <Select value={role} onValueChange={setRole} name="role">
                <SelectTrigger id="role-select" aria-label="Select role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUYER">Buyer</SelectItem>
                  <SelectItem value="SELLER">Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Create Account</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
