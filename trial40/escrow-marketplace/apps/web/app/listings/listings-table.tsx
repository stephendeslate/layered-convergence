// TRACED: EM-FE-010 — Dynamic import for bundle optimization
'use client';

export default function ListingsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottomColor: 'var(--border)', borderBottomWidth: '1px' }}>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Price</th>
            <th className="text-left p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2" colSpan={3} style={{ color: 'var(--muted-foreground)' }}>
              Loading table data...
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
