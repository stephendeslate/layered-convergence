import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">Analytics Engine</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Multi-tenant analytics platform with data pipelines, dashboards,
        and embeddable views.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create and manage analytics dashboards with customizable widgets.</p>
            <Link href="/dashboard">
              <Button>View Dashboards</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create an account to start building data pipelines.</p>
            <Link href="/register">
              <Button variant="outline">Register</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
