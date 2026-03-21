import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Conditional Payment Marketplace',
  description:
    'Two-sided marketplace with conditional payment release via Stripe Connect',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
