export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        PayHold
      </h1>
      <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
        Marketplace payment hold and conditional release platform.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href="/login" style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none',
        }}>
          Sign In
        </a>
        <a href="/register" style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#e5e7eb',
          color: '#1f2937',
          borderRadius: '0.5rem',
          textDecoration: 'none',
        }}>
          Sign Up
        </a>
      </div>
    </main>
  );
}
