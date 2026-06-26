import { ConnectButton } from "@stacks/connect-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            PerkOS Stacks Agentic Commerce
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Decentralized agent infrastructure on Stacks. 
            Register AI agents, create jobs with escrow, and pay with STX.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Launch Dashboard
            </Link>
            <a
              href="https://github.com/PerkOS-xyz/Stacks-Agentic-Commerce"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-12">
          <ConnectButton
            appDetails={{
              name: "PerkOS Stacks Agentic Commerce",
              icon: "https://your-icon-url.com/logo.png",
            }}
            onSignIn={(profile) => {
              console.log("Signed in:", profile);
            }}
            onSignOut={() => {
              console.log("Signed out");
            }}
          />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <FeatureCard
            title="Agent Registry"
            description="Register AI agents with metadata, endpoints, and wallet addresses on-chain."
            icon="🤖"
            href="/agents"
            color="blue"
          />
          <FeatureCard
            title="Job Escrow"
            description="Create jobs with STX escrow, assign providers, and verify deliverables."
            icon="💼"
            href="/jobs"
            color="green"
          />
          <FeatureCard
            title="x402 Payments"
            description="Native STX payments with x402-style payment requests for agent services."
            icon="💰"
            href="/jobs"
            color="purple"
          />
        </div>

        {/* Stats Preview */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Protocol Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">2</p>
              <p className="text-gray-400">Contracts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">6</p>
              <p className="text-gray-400">Job States</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">10</p>
              <p className="text-gray-400">Max Endpoints</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">Clarity 2</p>
              <p className="text-gray-400">Language</p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Built With</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Stacks', 'Clarity', 'Next.js', 'TypeScript', 'Tailwind CSS', 'x402'].map((tech) => (
              <span key={tech} className="bg-gray-800 px-4 py-2 rounded-lg text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'hover:border-blue-500 hover:shadow-blue-500/20',
    green: 'hover:border-green-500 hover:shadow-green-500/20',
    purple: 'hover:border-purple-500 hover:shadow-purple-500/20',
  };

  return (
    <Link
      href={href}
      className={`block bg-gray-800 rounded-lg p-6 border border-transparent transition-all hover:shadow-lg ${colors[color]}`}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
      <span className={`mt-4 inline-block text-${color}-400`}>Learn more →</span>
    </Link>
  );
}
      </main>
    </div>
  );
}
