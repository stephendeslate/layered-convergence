import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// [TRACED:FE-005] Home page
export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Get started by logging in or creating an account.</p>
        </CardContent>
      </Card>
    </div>
  );
}
