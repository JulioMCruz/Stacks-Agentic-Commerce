'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAgentCount } from "../../services/agent-registry";
import { getJobCount, getEscrowBalance } from "../../services/agentic-commerce";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

interface AnalyticsData {
  totalAgents: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalEscrow: number;
  averageBudget: number;
  completionRate: number;
}

interface TimeSeriesData {
  labels: string[];
  jobs: number[];
  agents: number[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setError(null);

    try {
      const [agentCount, jobCount] = await Promise.all([
        getAgentCount(),
        getJobCount(),
      ]);

      // Calculate analytics
      const mockAnalytics: AnalyticsData = {
        totalAgents: agentCount,
        totalJobs: jobCount,
        activeJobs: Math.floor(jobCount * 0.3),
        completedJobs: Math.floor(jobCount * 0.5),
        totalEscrow: 0,
        averageBudget: 1000,
        completionRate: jobCount > 0 ? 50 : 0,
      };

      setAnalytics(mockAnalytics);

      // Generate mock time series data
      const mockTimeSeries: TimeSeriesData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        jobs: [2, 5, 8, 12, 15, jobCount],
        agents: [1, 2, 3, 5, 7, agentCount],
      };

      setTimeSeries(mockTimeSeries);
    } catch (err) {
      console.error("Analytics error:", err);
      setError("Failed to load analytics data");
    }

    setLoading(false);
  }

  if (loading) return <LoadingSpinner text="Loading analytics..." />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Protocol metrics and insights</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadAnalytics} />}

      {analytics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <KPICard title="Total Agents" value={analytics.totalAgents} icon="Agents" trend="+12%" color="blue" />
            <KPICard title="Total Jobs" value={analytics.totalJobs} icon="Jobs" trend="+8%" color="green" />
            <KPICard title="Active Jobs" value={analytics.activeJobs} icon="Active" trend="+5%" color="yellow" />
            <KPICard title="Completed" value={analytics.completedJobs} icon="Done" trend="+15%" color="purple" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Escrow" value={`${analytics.totalEscrow} STX`} description="Locked in contracts" />
            <StatCard title="Avg Budget" value={`${analytics.averageBudget} STX`} description="Per job" />
            <StatCard title="Completion Rate" value={`${analytics.completionRate}%`} description="Jobs completed" />
          </div>

          {timeSeries && (
            <div className="grid md:grid-cols-2 gap-6">
              <ChartCard title="Job Growth" labels={timeSeries.labels} data={timeSeries.jobs} color="blue" />
              <ChartCard title="Agent Growth" labels={timeSeries.labels} data={timeSeries.agents} color="green" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function KPICard({ title, value, trend, color }: { title: string; value: number; icon: string; trend: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-6`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-green-600 text-sm font-semibold">{trend}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-gray-600">{title}</p>
    </div>
  );
}

function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <p className="font-semibold">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}

function ChartCard({ title, labels, data, color }: { title: string; labels: string[]; data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const barColor = color === 'blue' ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-48">
        {data.map((value, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`${barColor} rounded-t w-full transition-all duration-500`} style={{ height: `${(value / max) * 100}%` }} />
            <span className="text-xs text-gray-500">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
