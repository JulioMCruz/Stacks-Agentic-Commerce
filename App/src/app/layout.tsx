import "./globals.css";
import Header from "../components/Header";
import Logo from "../components/Logo";

export const metadata = {
  title: "PerkOS — Agentic Commerce on Bitcoin",
  description:
    "On-chain agent identity, job escrow, reputation and validation — built on Stacks, settled on Bitcoin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Header />
        <main>{children}</main>
        <footer className="mt-28 border-t border-white/[0.08]">
          <div className="container-x flex flex-col items-center justify-between gap-4 py-8 text-sm text-mist-500 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <Logo className="h-5 w-5" />
              <span className="font-medium text-mist-300">PerkOS Agentic Commerce</span>
            </div>
            <span>Built on Stacks · Settled on Bitcoin · © 2026</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
