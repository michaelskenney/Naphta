import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Naphta — Epstein Email Explorer",
  description: "Search and browse the Epstein email corpus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <a href="/" className="flex items-baseline gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-50">
                Naphta
              </h1>
              <span className="text-sm text-zinc-500">
                Epstein Email Explorer
              </span>
            </a>
            <nav className="flex items-center gap-4">
              <a
                href="/emails"
                className="text-sm text-zinc-400 transition hover:text-zinc-200"
              >
                Emails
              </a>
              <a
                href="/gallery"
                className="text-sm text-zinc-400 transition hover:text-zinc-200"
              >
                Gallery
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
