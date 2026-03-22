import { Skeleton } from '@/components/ui/skeleton';

// TRACED: AE-FE-008
export default function HomeLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading home page">
      <Skeleton style={{ height: '2rem', width: '16rem', marginBottom: '0.5rem' }} />
      <Skeleton style={{ height: '1.25rem', width: '32rem', marginBottom: '2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} style={{ height: '10rem', borderRadius: 'var(--radius)' }} />
        ))}
      </div>
    </div>
  );
}
