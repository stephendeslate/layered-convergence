import { Skeleton } from '@/components/ui/skeleton';

export default function PipelinesLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading pipelines">
      <Skeleton style={{ height: '2rem', width: '10rem', marginBottom: '2rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} style={{ height: '4rem', borderRadius: 'var(--radius)' }} />
        ))}
      </div>
    </div>
  );
}
