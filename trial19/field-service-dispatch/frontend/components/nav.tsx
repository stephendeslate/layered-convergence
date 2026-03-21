import type { User } from '@/lib/types';
import { logoutAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavProps {
  user: User;
}

export function Nav({ user }: NavProps) {
  return (
    <nav aria-label="Main navigation" className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-lg font-bold text-foreground">
              Field Service
            </a>
            <a href="/work-orders" className="text-foreground hover:text-primary font-medium">
              Work Orders
            </a>
            <a href="/technicians" className="text-foreground hover:text-primary font-medium">
              Technicians
            </a>
            <a href="/customers" className="text-foreground hover:text-primary font-medium">
              Customers
            </a>
            <a href="/routes" className="text-foreground hover:text-primary font-medium">
              Routes
            </a>
            <a href="/invoices" className="text-foreground hover:text-primary font-medium">
              Invoices
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Badge variant="outline">{user.role}</Badge>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" aria-label="Log out">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
