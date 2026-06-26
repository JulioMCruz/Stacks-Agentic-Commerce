'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAgent, getAgentCount, Agent } from "../../services/agent-registry";
import { getJob, getJobCount, Job } from "../../services/agentic-commerce";
import LoadingSpinner from "../../components/LoadingSpinner";

interface SearchResult {
  id: string;
  type: 'agent' | 'job';
  title: string;
  description: string;
  link: string;
  metadata: Record<string, string>;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function performSearch() {
    if (!query.trim()) return;
    
    setLoading(true);
    setSearched(true);

    try {
      const searchResults: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();

      // Search agents
      const agentCount = await getAgentCount();
      for (let i = 1; i <= agentCount; i++) {
        const agent = await getAgent(i);
        if (agent && (
          agent.name.toLowerCase().includes(lowerQuery) ||
          agent.description.toLowerCase().includes(lowerQuery) ||
          agent.wallet.toLowerCase().includes(lowerQuery)
        )) {
          searchResults.push({
            id: `agent-${i}`,
            type: 'agent',
            title: agent.name,
            description: agent.description,
            link: `/agents`,
            metadata: {
              wallet: agent.wallet,
              status: agent.active ? 'Active' : 'Inactive',
            },
          });
        }
      }

      // Search jobs
      const jobCount = await getJobCount();
      for (let i = 1; i <= jobCount; i++) {
        const job = await getJob(i);
        if (job && (
          job.description.toLowerCase().includes(lowerQuery) ||
          job.client.toLowerCase().includes(lowerQuery) ||
          (job.provider && job.provider.toLowerCase().includes(lowerQuery))
        )) {
          searchResults.push({
            id: `job-${i}`,
            type: 'job',
            title: `Job #${i}`,
            description: job.description,
            link: `/jobs`,
            metadata: {
              budget: `${job.budget} STX`,
              status: ['Open', 'Funded', 'Submitted', 'Completed', 'Rejected', 'Expired'][job.status] || 'Unknown',
            },
          });
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
    }

    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    performSearch();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-gray-600">Find agents, jobs, and transactions</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents, jobs, addresses..."
            className="flex-1 border rounded-lg px-4 py-3 text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div>
          <p className="text-gray-600 mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No results found for "{query}".</p>
              <p className="text-gray-400 mt-2">Try searching for agents, jobs, or wallet addresses.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.link}
                  className="block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.type === 'agent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {result.type === 'agent' ? '🤖 Agent' : '📋 Job'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">{result.title}</h3>
                      <p className="text-gray-600 mt-1">{result.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(result.metadata).map(([key, value]) => (
                          <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-blue-600 ml-4">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
