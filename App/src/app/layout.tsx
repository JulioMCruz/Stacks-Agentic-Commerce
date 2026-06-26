import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PerkOS Stacks Agentic Commerce",
  description: "Agent infrastructure on Stacks: Agent identity registry + job escrow with x402 payments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="bg-gray-900 text-white py-4 text-center">
          <p>PerkOS Stacks Agentic Commerce &copy; 2026</p>
        </footer>
      </body>
    </html>
  );
}
