'use client';

interface StateHistoryEntry {
  id: string;
  fromState: string;
  toState: string;
  reason: string | null;
  performedBy: string | null;
  createdAt: string;
}

const stateColors: Record<string, string> = {
  CREATED: '#6b7280',
  HELD: '#3b82f6',
  RELEASED: '#10b981',
  DISPUTED: '#ef4444',
  REFUNDED: '#f59e0b',
  EXPIRED: '#9ca3af',
};

export default function TransactionTimeline({ history }: { history: StateHistoryEntry[] }) {
  return (
    <div style={{ position: 'relative', paddingLeft: '24px' }}>
      <div style={{
        position: 'absolute',
        left: '8px',
        top: '0',
        bottom: '0',
        width: '2px',
        backgroundColor: '#e5e7eb',
      }} />
      {history.map((entry, i) => (
        <div key={entry.id} style={{ position: 'relative', paddingBottom: '16px' }}>
          <div style={{
            position: 'absolute',
            left: '-20px',
            top: '4px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: stateColors[entry.toState] ?? '#6b7280',
            border: '2px solid white',
            boxShadow: '0 0 0 2px ' + (stateColors[entry.toState] ?? '#6b7280'),
          }} />
          <div style={{ fontSize: '14px', fontWeight: 600 }}>
            {entry.fromState === entry.toState ? entry.toState : `${entry.fromState} \u2192 ${entry.toState}`}
          </div>
          {entry.reason && (
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
              {entry.reason}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
            {new Date(entry.createdAt).toLocaleString()}
            {entry.performedBy && entry.performedBy !== 'system' && ` \u2022 by ${entry.performedBy}`}
          </div>
        </div>
      ))}
    </div>
  );
}
