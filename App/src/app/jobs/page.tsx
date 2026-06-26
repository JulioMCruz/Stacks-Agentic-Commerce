'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { getJob, getJobCount, getEscrowBalance, Job } from "../../services/agentic-commerce";
import { openContractCall } from "@stacks/connect-react";
import { uintCV, stringAsciiCV, principalCV, optionalCV, noneCV, someCV, bufferCVFromString } from "@stacks/transactions";
import { CONTRACT_ADDRESS, AGENTIC_COMMERCE_CONTRACT } from "../../constants/contract";
import { NETWORK } from "../../constants/network";

const STATUS_LABELS: Record<number, string> = {
  0: "Open",
  1: "Funded",
  2: "Submitted",
  3: "Completed",
  4: "Rejected",
  5: "Expired",
};

const STATUS_COLORS: Record<number, string> = {
  0: "bg-gray-100 text-gray-800",
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-blue-100 text-blue-800",
  3: "bg-green-100 text-green-800",
  4: "bg-red-100 text-red-800",
  5: "bg-gray-100 text-gray-500",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    evaluator: "",
    provider: "",
    budget: "",
    duration: "100",
  });
  const [actionForm, setActionForm] = useState<{
    jobId: number;
    budget?: string;
    provider?: string;
  } | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);
    setError(null);
    try {
      const count = await getJobCount();
      const jobList: Job[] = [];
      for (let i = 1; i <= count; i++) {
        const job = await getJob(i);
        if (job) {
          job.escrow = await getEscrowBalance(i);
          jobList.push(job);
        }
      }
      setJobs(jobList);
    } catch (error) {
      console.error("Error loading jobs:", error);
      setError("Failed to load jobs. Please try again.");
    }
    setLoading(false);
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    setActiveAction("creating");
    
    try {
      const currentBlock = 1000; // TODO: Get actual block height from network
      const expiredAt = currentBlock + parseInt(formData.duration);
      
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: "agentic-commerce",
        functionName: "create-job",
        functionArgs: [
          optionalCV(formData.provider ? someCV(principalCV(formData.provider)) : noneCV()),
          principalCV(formData.evaluator),
          uintCV(expiredAt),
          stringAsciiCV(formData.description),
        ],
        network: NETWORK,
        appDetails: {
          name: "PerkOS Stacks Agentic Commerce",
          icon: "https://your-icon-url.com/logo.png",
        },
        onFinish: (data) => {
          console.log("Job created:", data);
          setShowForm(false);
          setActiveAction(null);
          loadJobs();
        },
        onCancel: () => {
          console.log("Transaction cancelled");
          setActiveAction(null);
        },
      });
    } catch (error) {
      console.error("Error creating job:", error);
      setActiveAction(null);
    }
  }

  async function handleSetBudget(jobId: number) {
    if (!actionForm?.budget) return;
    setActiveAction(`setting-budget-${jobId}`);
    
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: "agentic-commerce",
        functionName: "set-budget",
        functionArgs: [uintCV(jobId), uintCV(parseInt(actionForm.budget))],
        network: NETWORK,
        appDetails: {
          name: "PerkOS Stacks Agentic Commerce",
          icon: "https://your-icon-url.com/logo.png",
        },
        onFinish: (data) => {
          console.log("Budget set:", data);
          setActionForm(null);
          setActiveAction(null);
          loadJobs();
        },
        onCancel: () => {
          console.log("Transaction cancelled");
          setActiveAction(null);
        },
      });
    } catch (error) {
      console.error("Error setting budget:", error);
      setActiveAction(null);
    }
  }

  async function handleAssignProvider(jobId: number) {
    if (!actionForm?.provider) return;
    setActiveAction(`assigning-provider-${jobId}`);
    
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: "agentic-commerce",
        functionName: "assign-provider",
        functionArgs: [uintCV(jobId), principalCV(actionForm.provider)],
        network: NETWORK,
        appDetails: {
          name: "PerkOS Stacks Agentic Commerce",
          icon: "https://your-icon-url.com/logo.png",
        },
        onFinish: (data) => {
          console.log("Provider assigned:", data);
          setActionForm(null);
          setActiveAction(null);
          loadJobs();
        },
        onCancel: () => {
          console.log("Transaction cancelled");
          setActiveAction(null);
        },
      });
    } catch (error) {
      console.error("Error assigning provider:", error);
      setActiveAction(null);
    }
  }

  async function handleFundJob(jobId: number) {
    setActiveAction(`funding-${jobId}`);
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: "agentic-commerce",
        functionName: "fund-job",
        functionArgs: [uintCV(jobId)],
        network: NETWORK,
        appDetails: {
          name: "PerkOS Stacks Agentic Commerce",
          icon: "https://your-icon-url.com/logo.png",
        },
        onFinish: (data) => {
          console.log("Job funded:", data);
          setActiveAction(null);
          loadJobs();
        },
        onCancel: () => {
          console.log("Transaction cancelled");
          setActiveAction(null);
        },
      });
    } catch (error) {
      console.error("Error funding job:", error);
      setActiveAction(null);
    }
  }

  async function handleSubmitWork(jobId: number) {
    setActiveAction(`submitting-${jobId}`);
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: "agentic-commerce",
        functionName: "submit-work",
        functionArgs: [
          uintCV(jobId),
          bufferCVFromString("work-submitted"),
        ],
        network: NETWORK,
        appDetails: {
          name: "PerkOS Stacks Agentic Commerce",
          icon: "https://your-icon-url.com/logo.png",
        },
        onFinish: (data) => {
          console.log("Work submitted:", data);
          setActiveAction(null);
          loadJobs();
        },
        onCancel: () => {
          console.log("Transaction cancelled");
          setActiveAction(null);
        },
      });
    } catch (error) {
      console.error("Error submitting work:", error);
      setActiveAction(null);
    }
  }

  async function handleCompleteJob(jobId: number) {
    setActiveAction(`completing-${jobId}`);
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: "agentic-commerce",
        functionName: "complete-job",
        functionArgs: [uintCV(jobId)],
        network: NETWORK,
        appDetails: {
          name: "PerkOS Stacks Agentic Commerce",
          icon: "https://your-icon-url.com/logo.png",
        },
        onFinish: (data) => {
          console.log("Job completed:", data);
          setActiveAction(null);
          loadJobs();
        },
        onCancel: () => {
          console.log("Transaction cancelled");
          setActiveAction(null);
        },
      });
    } catch (error) {
      console.error("Error completing job:", error);
      setActiveAction(null);
    }
  }

  async function handleRejectJob(jobId: number) {
    setActiveAction(`rejecting-${jobId}`);
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: "agentic-commerce",
        functionName: "reject-job",
        functionArgs: [uintCV(jobId)],
        network: NETWORK,
        appDetails: {
          name: "PerkOS Stacks Agentic Commerce",
          icon: "https://your-icon-url.com/logo.png",
        },
        onFinish: (data) => {
          console.log("Job rejected:", data);
          setActiveAction(null);
          loadJobs();
        },
        onCancel: () => {
          console.log("Transaction cancelled");
          setActiveAction(null);
        },
      });
    } catch (error) {
      console.error("Error rejecting job:", error);
      setActiveAction(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Agentic Commerce</h1>
          <p className="text-gray-600">Create and manage jobs with STX escrow.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={!!activeAction}
        >
          {showForm ? "Cancel" : "Create Job"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={loadJobs} className="ml-4 underline">Retry</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateJob} className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Job</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Evaluator</label>
              <input
                type="text"
                value={formData.evaluator}
                onChange={(e) => setFormData({ ...formData, evaluator: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="ST..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Provider (optional)</label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="ST..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (blocks)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={activeAction === "creating"}
          >
            {activeAction === "creating" ? "Creating..." : "Create Job"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500">No jobs created yet. Create the first one!</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">Job #{job.id}</h3>
                  <p className="text-gray-600 text-sm">{job.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[job.status] || 'bg-gray-100'}`}>
                  {STATUS_LABELS[job.status] || "Unknown"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Client</p>
                  <p className="font-mono truncate">{job.client}</p>
                </div>
                <div>
                  <p className="text-gray-500">Provider</p>
                  <p className="font-mono truncate">{job.provider || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Evaluator</p>
                  <p className="font-mono truncate">{job.evaluator}</p>
                </div>
                <div>
                  <p className="text-gray-500">Budget</p>
                  <p>{job.budget} STX</p>
                </div>
              </div>

              {job.escrow !== undefined && job.escrow > 0 && (
                <div className="mb-3 text-sm">
                  <span className="text-gray-500">Escrow: </span>
                  <span className="font-semibold">{job.escrow} STX</span>
                </div>
              )}

              {/* Action Forms */}
              {actionForm?.jobId === job.id && (
                <div className="bg-gray-50 p-3 rounded mb-3">
                  {activeAction?.startsWith("setting-budget") && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Budget in STX"
                        value={actionForm.budget || ""}
                        onChange={(e) => setActionForm({ ...actionForm, budget: e.target.value })}
                        className="border rounded px-2 py-1 flex-1"
                      />
                      <button
                        onClick={() => handleSetBudget(job.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Set Budget
                      </button>
                      <button
                        onClick={() => setActionForm(null)}
                        className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {activeAction?.startsWith("assigning-provider") && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Provider address (ST...)"
                        value={actionForm.provider || ""}
                        onChange={(e) => setActionForm({ ...actionForm, provider: e.target.value })}
                        className="border rounded px-2 py-1 flex-1"
                      />
                      <button
                        onClick={() => handleAssignProvider(job.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => setActionForm(null)}
                        className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {job.status === 0 && (
                  <>
                    <button
                      onClick={() => {
                        setActionForm({ jobId: job.id, budget: "" });
                        setActiveAction(`setting-budget-${job.id}`);
                      }}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                    >
                      Set Budget
                    </button>
                    {job.budget > 0 && (
                      <button
                        onClick={() => handleFundJob(job.id)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                        disabled={activeAction === `funding-${job.id}`}
                      >
                        {activeAction === `funding-${job.id}` ? "Funding..." : "Fund Job"}
                      </button>
                    )}
                  </>
                )}
                {job.status === 1 && (
                  <>
                    {!job.provider && (
                      <button
                        onClick={() => {
                          setActionForm({ jobId: job.id, provider: "" });
                          setActiveAction(`assigning-provider-${job.id}`);
                        }}
                        className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                      >
                        Assign Provider
                      </button>
                    )}
                    <button
                      onClick={() => handleSubmitWork(job.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                      disabled={activeAction === `submitting-${job.id}`}
                    >
                      {activeAction === `submitting-${job.id}` ? "Submitting..." : "Submit Work"}
                    </button>
                  </>
                )}
                {job.status === 2 && (
                  <>
                    <button
                      onClick={() => handleCompleteJob(job.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      disabled={activeAction === `completing-${job.id}`}
                    >
                      {activeAction === `completing-${job.id}` ? "Completing..." : "Complete"}
                    </button>
                    <button
                      onClick={() => handleRejectJob(job.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                      disabled={activeAction === `rejecting-${job.id}`}
                    >
                      {activeAction === `rejecting-${job.id}` ? "Rejecting..." : "Reject"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
