// [TRACED:EM-008] Next.js 15 with React 19 and Tailwind CSS 4 frontend
// [TRACED:EM-037] Root layout with Nav and skip-to-content
import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

// [TRACED:FE-002] Root layout with Nav and skip-to-content link
export const metadata: Metadata = {
  title: "Application",
  description: "Application built with Next.js 15",
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
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
