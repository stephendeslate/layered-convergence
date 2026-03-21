// [TRACED:EM-037] Root layout with Nav and skip-to-content link
import "./globals.css";
import { Nav } from "../components/nav";

export const metadata = {
  title: "Escrow Marketplace",
  description: "Secure transaction escrow platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-[var(--primary)] focus:text-[var(--primary-foreground)]"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
