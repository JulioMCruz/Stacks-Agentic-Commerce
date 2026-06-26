'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Fingerprint, Briefcase, Coins, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { getAgent, getAgentCount } from "../../services/agent-registry";
import { getJob, getJobCount } from "../../services/agentic-commerce";
import LoadingSpinner from "../../components/LoadingSpinner";

interface ActivityItem {
  id: string;
  type: "agent_registered" | "job_created" | "job_funded" | "job_completed" | "job_rejected";
  title: string;
  description: string;
  timestamp: number;
  principal: string;
  link: string;
}

const TYPE: Record<string, { icon: any; cls: string }> = {
  agent_registered: { icon: Fingerprint, cls: "border-brand/30 text-brand-300" },
  job_created: { icon: Briefcase, cls: "border-white/10 text-mist-300" },
  job_funded: { icon: Coins, cls: "border-bitcoin/30 text-bitcoin-400" },
  job_completed: { icon: CheckCircle2, cls: "border-emerald-500/30 text-emerald-300" },
  job_rejected: { icon: XCircle, cls: "border-red-500/30 text-red-300" },
};

export default function ActivityFeedPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);
    try {
      const [agentCount, jobCount] = await Promise.all([getAgentCount(), getJobCount()]);
      const items: ActivityItem[] = [];

      for (let i = 1; i <= agentCount; i++) {
        const agent = await getAgent(i);
        if (agent) {
          items.push({
            id: `agent-${i}`,
            type: "agent_registered",
            title: "Agent Registered",
            description: `${agent.name} was registered`,
            timestamp: Date.now() - i * 86400000,
            principal: agent.creator,
            link: "/agents",
          });
        }
      }

      for (let i = 1; i <= jobCount; i++) {
        const job = await getJob(i);
        if (job) {
          items.push({
            id: `job-${i}`,
            type: job.status === 3 ? "job_completed" : job.status === 1 ? "job_funded" : job.status === 4 ? "job_rejected" : "job_created",
            title: job.status === 3 ? "Job Completed" : job.status === 1 ? "Job Funded" : job.status === 4 ? "Job Rejected" : "Job Created",
            description: `Job #${i}: ${job.description.substring(0, 60)}…`,
            timestamp: Date.now() - i * 43200000,
            principal: job.client,
            link: "/jobs",
          });
        }
      }

      items.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(items);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
    setLoading(false);
  }

  const filtered = filter === "all" ? activities : activities.filter((a) => a.type === filter);
  const typeLabels: Record<string, string> = {
    all: "All",
    agent_registered: "Agents",
    job_created: "Created",
    job_funded: "Funded",
    job_completed: "Completed",
    job_rejected: "Rejected",
  };

  return (
    <div className="container-x py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-mist-500 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
          <p className="mt-1.5 text-mist-300">Latest protocol activity, on-chain.</p>
        </div>
        <button onClick={loadActivities} className="btn-ghost">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              filter === key ? "bg-white/[0.08] text-white" : "border border-white/[0.08] text-mist-300 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading activity…" />
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-mist-500">No activity found.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((activity) => {
            const t = TYPE[activity.type];
            const Icon = t.icon;
            return (
              <Link key={activity.id} href={activity.link} className="card card-hover group flex items-center gap-4 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white/[0.02] ${t.cls}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{activity.title}</span>
                    <span className="text-xs text-mist-500">{new Date(activity.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="truncate text-sm text-mist-300">{activity.description}</p>
                  <p className="truncate font-mono text-xs text-mist-500">{activity.principal}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-mist-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
