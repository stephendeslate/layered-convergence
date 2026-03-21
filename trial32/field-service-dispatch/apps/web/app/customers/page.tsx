import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { fetchCustomers } from '@/app/actions';

export default async function CustomersPage() {
  let customers: Awaited<ReturnType<typeof fetchCustomers>> = [];

  try {
    customers = await fetchCustomers();
  } catch {
    customers = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.address}</TableCell>
            </TableRow>
          ))}
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">No customers found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
