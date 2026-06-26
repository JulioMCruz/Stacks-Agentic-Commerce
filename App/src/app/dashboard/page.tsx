'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAgent, getAgentCount, Agent } from "../../services/agent-registry";
import { getJob, getJobCount, Job } from "../../services/agentic-commerce";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    agents: 0,
    jobs: 0,
    fundedJobs: 0,
    completedJobs: 0,
    totalEscrow: 0,
  });
  const [recentAgents, setRecentAgents] = useState<Agent[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    
    try {
      // Load agents
      const agentCount = await getAgentCount();
      const agents: Agent[] = [];
      for (let i = 1; i <= Math.min(agentCount, 5); i++) {
        const agent = await getAgent(i);
        if (agent) agents.push(agent);
      }
      setRecentAgents(agents);

      // Load jobs
      const jobCount = await getJobCount();
      const jobs: Job[] = [];
      let fundedCount = 0;
      let completedCount = 0;
      let totalEscrow = 0;
      
      for (let i = 1; i <= jobCount; i++) {
        const job = await getJob(i);
        if (job) {
          if (job.status === 1) fundedCount++;
          if (job.status === 3) completedCount++;
          totalEscrow += job.escrow || 0;
          
          if (jobs.length < 5) jobs.push(job);
        }
      }
      
      setRecentJobs(jobs);
      setStats({
        agents: agentCount,
        jobs: jobCount,
        fundedJobs: fundedCount,
        completedJobs: completedCount,
        totalEscrow,
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard data.");
    }
    
    setLoading(false);
  }

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PerkOS Stacks Agentic Commerce</h1>
        <p className="text-gray-600">Decentralized agent infrastructure with x402 payments</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadDashboard} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Agents" value={stats.agents} icon="🤖" />
        <StatCard title="Jobs" value={stats.jobs} icon="📋" />
        <StatCard title="Funded" value={stats.fundedJobs} icon="💰" />
        <StatCard title="Completed" value={stats.completedJobs} icon="✅" />
      </div>

      {/* Total Escrow */}
      {stats.totalEscrow > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800">
            <span className="font-bold">Total Escrow: </span>
            {stats.totalEscrow} STX locked in contracts
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link 
          href="/agents" 
          className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">🤖 Agent Registry</h3>
          <p className="text-gray-600">Register and manage AI agents on Stacks</p>
          <span className="text-blue-600 mt-2 inline-block">View Agents →</span>
        </Link>
        
        <Link 
          href="/jobs" 
          className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">💼 Agentic Commerce</h3>
          <p className="text-gray-600">Create jobs with STX escrow payments</p>
          <span className="text-blue-600 mt-2 inline-block">View Jobs →</span>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Agents</h2>
          {recentAgents.length === 0 ? (
            <p className="text-gray-500">No agents registered yet</p>
          ) : (
            <div className="space-y-3">
              {recentAgents.map((agent) => (
                <div key={agent.id} className="border rounded p-3">
                  <p className="font-semibold">{agent.name}</p>
                  <p className="text-sm text-gray-500">{agent.description.substring(0, 60)}...</p>
                  <span className={`text-xs px-2 py-1 rounded ${agent.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {agent.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
          {recentJobs.length === 0 ? (
            <p className="text-gray-500">No jobs created yet</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="border rounded p-3">
                  <p className="font-semibold">Job #{job.id}</p>
                  <p className="text-sm text-gray-500">{job.description.substring(0, 60)}...</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {job.budget} STX
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      job.status === 0 ? 'bg-gray-100' :
                      job.status === 1 ? 'bg-yellow-100' :
                      job.status === 2 ? 'bg-blue-100' :
                      job.status === 3 ? 'bg-green-100' :
                      'bg-red-100'
                    }`}>
                      {job.status === 0 ? 'Open' :
                       job.status === 1 ? 'Funded' :
                       job.status === 2 ? 'Submitted' :
                       job.status === 3 ? 'Completed' :
                       job.status === 4 ? 'Rejected' : 'Expired'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-gray-600">{title}</p>
    </div>
  );
}
