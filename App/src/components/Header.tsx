import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            PerkOS Stacks Agentic Commerce
          </Link>
          <nav className="flex space-x-6">
            <Link href="/agents" className="hover:text-gray-300">
              Agents
            </Link>
            <Link href="/jobs" className="hover:text-gray-300">
              Jobs
            </Link>
            <Link 
              href="https://github.com/PerkOS-xyz/Stacks-Agentic-Commerce" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-300"
            >
              GitHub
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
