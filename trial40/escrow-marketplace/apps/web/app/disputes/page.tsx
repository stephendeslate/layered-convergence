// TRACED: EM-FE-008 — Disputes page with Server Actions
import { fetchDisputes } from '../../lib/actions';

export default async function DisputesPage() {
  const disputes = await fetchDisputes();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Disputes</h1>
      {disputes.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No disputes found.</p>
      ) : (
        <div className="grid gap-4">
          {disputes.map((dispute: { id: string; reason: string; status: string; transactionId: string }) => (
            <div
              key={dispute.id}
              className="rounded-lg border p-4"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Dispute</span>
                <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: 'var(--secondary)' }}>
                  {dispute.status}
                </span>
              </div>
              <p style={{ color: 'var(--muted-foreground)' }}>{dispute.reason}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                TX: {dispute.transactionId}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
