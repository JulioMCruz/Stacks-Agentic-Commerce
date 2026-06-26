'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAgent, getAgentCount, Agent } from "../../services/agent-registry";
import { getJob, getJobCount, Job } from "../../services/agentic-commerce";
import LoadingSpinner from "../../components/LoadingSpinner";

interface ActivityItem {
  id: string;
  type: 'agent_registered' | 'job_created' | 'job_funded' | 'job_completed' | 'job_rejected';
  title: string;
  description: string;
  timestamp: number;
  principal: string;
  link: string;
}

export default function ActivityFeedPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);
    try {
      const [agentCount, jobCount] = await Promise.all([
        getAgentCount(),
        getJobCount(),
      ]);

      const items: ActivityItem[] = [];

      // Load agents
      for (let i = 1; i <= agentCount; i++) {
        const agent = await getAgent(i);
        if (agent) {
          items.push({
            id: `agent-${i}`,
            type: 'agent_registered',
            title: 'Agent Registered',
            description: `${agent.name} was registered`,
            timestamp: Date.now() - i * 86400000,
            principal: agent.creator,
            link: `/agents`,
          });
        }
      }

      // Load jobs
      for (let i = 1; i <= jobCount; i++) {
        const job = await getJob(i);
        if (job) {
          items.push({
            id: `job-${i}`,
            type: job.status === 3 ? 'job_completed' : 
                  job.status === 1 ? 'job_funded' : 
                  job.status === 4 ? 'job_rejected' : 'job_created',
            title: job.status === 3 ? 'Job Completed' :
                   job.status === 1 ? 'Job Funded' :
                   job.status === 4 ? 'Job Rejected' : 'Job Created',
            description: `Job #${i}: ${job.description.substring(0, 60)}...`,
            timestamp: Date.now() - i * 43200000,
            principal: job.client,
            link: `/jobs`,
          });
        }
      }

      // Sort by timestamp (newest first)
      items.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(items);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
    setLoading(false);
  }

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  const typeLabels: Record<string, string> = {
    all: 'All Activity',
    agent_registered: 'Agents',
    job_created: 'Jobs Created',
    job_funded: 'Jobs Funded',
    job_completed: 'Jobs Completed',
    job_rejected: 'Jobs Rejected',
  };

  const typeIcons: Record<string, string> = {
    agent_registered: '🤖',
    job_created: '📋',
    job_funded: '💰',
    job_completed: '✅',
    job_rejected: '❌',
  };

  const typeColors: Record<string, string> = {
    agent_registered: 'bg-blue-100 text-blue-800',
    job_created: 'bg-gray-100 text-gray-800',
    job_funded: 'bg-yellow-100 text-yellow-800',
    job_completed: 'bg-green-100 text-green-800',
    job_rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Activity Feed</h1>
          <p className="text-gray-600">Latest protocol activity</p>
        </div>
        <button
          onClick={loadActivities}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading activity..." />
      ) : filteredActivities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No activity found</p>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <Link
              key={activity.id}
              href={activity.link}
              className="block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{typeIcons[activity.type]}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded ${typeColors[activity.type]}`}>
                        {activity.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-800">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {activity.principal}
                    </p>
                  </div>
                </div>
                <span className="text-blue-600 text-sm">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
