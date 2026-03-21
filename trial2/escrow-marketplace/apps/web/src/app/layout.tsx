import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PayHold - Marketplace Payments',
  description: 'Marketplace payment hold and conditional release platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="demo-banner" style={{
          backgroundColor: '#fef3c7',
          borderBottom: '2px solid #f59e0b',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 600,
          color: '#92400e',
        }}>
          Demo application — no real funds are processed.
        </div>
        {children}
      </body>
    </html>
  );
}
