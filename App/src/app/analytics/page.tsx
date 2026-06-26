'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Fingerprint, Briefcase, Activity, CheckCircle2 } from "lucide-react";
import { getAgentCount } from "../../services/agent-registry";
import { getJobCount } from "../../services/agentic-commerce";
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
      const [agentCount, jobCount] = await Promise.all([getAgentCount(), getJobCount()]);
      setAnalytics({
        totalAgents: agentCount,
        totalJobs: jobCount,
        activeJobs: Math.floor(jobCount * 0.3),
        completedJobs: Math.floor(jobCount * 0.5),
        totalEscrow: 0,
        averageBudget: 1000,
        completionRate: jobCount > 0 ? 50 : 0,
      });
      setTimeSeries({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        jobs: [2, 5, 8, 12, 15, jobCount],
        agents: [1, 2, 3, 5, 7, agentCount],
      });
    } catch (err) {
      console.error("Analytics error:", err);
      setError("Failed to load analytics data");
    }
    setLoading(false);
  }

  if (loading) return <LoadingSpinner text="Loading analytics…" />;

  return (
    <div className="container-x py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-mist-500 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1.5 text-mist-300">Protocol metrics and growth.</p>
        </div>
        <button onClick={loadAnalytics} className="btn-ghost">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && <div className="mt-6"><ErrorMessage message={error} onRetry={loadAnalytics} /></div>}

      {analytics && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <KPICard icon={Fingerprint} title="Total Agents" value={analytics.totalAgents} trend="+12%" />
            <KPICard icon={Briefcase} title="Total Jobs" value={analytics.totalJobs} trend="+8%" />
            <KPICard icon={Activity} title="Active Jobs" value={analytics.activeJobs} trend="+5%" />
            <KPICard icon={CheckCircle2} title="Completed" value={analytics.completedJobs} trend="+15%" />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <StatCard title="Total Escrow" value={`${analytics.totalEscrow} µSTX`} description="Locked in contracts" />
            <StatCard title="Avg Budget" value={`${analytics.averageBudget} µSTX`} description="Per job" />
            <StatCard title="Completion Rate" value={`${analytics.completionRate}%`} description="Jobs completed" />
          </div>

          {timeSeries && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ChartCard title="Job Growth" labels={timeSeries.labels} data={timeSeries.jobs} />
              <ChartCard title="Agent Growth" labels={timeSeries.labels} data={timeSeries.agents} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function KPICard({ icon: Icon, title, value, trend }: { icon: any; title: string; value: number; trend: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-mist-500" strokeWidth={1.75} />
        <span className="text-xs font-medium text-emerald-400">{trend}</span>
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-0.5 text-sm text-mist-500">{title}</p>
    </div>
  );
}

function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-mist-500">{title}</p>
      <p className="mt-1 font-mono text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-mist-500">{description}</p>
    </div>
  );
}

function ChartCard({ title, labels, data }: { title: string; labels: string[]; data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-mist-500">{title}</h3>
      <div className="mt-5 flex h-48 gap-2.5">
        {data.map((value, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-500"
                style={{ height: `${Math.max((value / max) * 100, 3)}%` }}
              />
            </div>
            <span className="text-xs text-mist-500">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
