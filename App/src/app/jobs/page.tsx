'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Briefcase } from "lucide-react";
import { getJob, getJobCount, getEscrowBalance, Job } from "../../services/agentic-commerce";
import StatusBadge from "../../components/StatusBadge";
import { request } from "@stacks/connect";
import { Cl } from "@stacks/transactions";
import { CONTRACT_ADDRESS } from "../../constants/contract";
import { NETWORK_NAME } from "../../constants/network";

const AGENTIC_COMMERCE = `${CONTRACT_ADDRESS}.agentic-commerce` as `${string}.${string}`;

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
  const [actionForm, setActionForm] = useState<{ jobId: number; budget?: string; provider?: string } | null>(null);

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

      await request("stx_callContract", {
        contract: AGENTIC_COMMERCE,
        functionName: "create-job",
        functionArgs: [
          formData.provider ? Cl.some(Cl.principal(formData.provider)) : Cl.none(),
          Cl.principal(formData.evaluator),
          Cl.uint(expiredAt),
          Cl.stringAscii(formData.description),
        ],
        network: NETWORK_NAME,
      });
      setShowForm(false);
      loadJobs();
    } catch (error) {
      console.error("Error creating job:", error);
    } finally {
      setActiveAction(null);
    }
  }

  async function handleSetBudget(jobId: number) {
    if (!actionForm?.budget) return;
    setActiveAction(`setting-budget-${jobId}`);

    try {
      await request("stx_callContract", {
        contract: AGENTIC_COMMERCE,
        functionName: "set-budget",
        functionArgs: [Cl.uint(jobId), Cl.uint(parseInt(actionForm.budget))],
        network: NETWORK_NAME,
      });
      setActionForm(null);
      loadJobs();
    } catch (error) {
      console.error("Error setting budget:", error);
    } finally {
      setActiveAction(null);
    }
  }

  async function handleAssignProvider(jobId: number) {
    if (!actionForm?.provider) return;
    setActiveAction(`assigning-provider-${jobId}`);

    try {
      await request("stx_callContract", {
        contract: AGENTIC_COMMERCE,
        functionName: "assign-provider",
        functionArgs: [Cl.uint(jobId), Cl.principal(actionForm.provider)],
        network: NETWORK_NAME,
      });
      setActionForm(null);
      loadJobs();
    } catch (error) {
      console.error("Error assigning provider:", error);
    } finally {
      setActiveAction(null);
    }
  }

  async function handleFundJob(jobId: number) {
    setActiveAction(`funding-${jobId}`);
    try {
      await request("stx_callContract", {
        contract: AGENTIC_COMMERCE,
        functionName: "fund-job",
        functionArgs: [Cl.uint(jobId)],
        network: NETWORK_NAME,
      });
      loadJobs();
    } catch (error) {
      console.error("Error funding job:", error);
    } finally {
      setActiveAction(null);
    }
  }

  async function handleSubmitWork(jobId: number) {
    setActiveAction(`submitting-${jobId}`);
    try {
      await request("stx_callContract", {
        contract: AGENTIC_COMMERCE,
        functionName: "submit-work",
        functionArgs: [Cl.uint(jobId), Cl.bufferFromAscii("work-submitted")],
        network: NETWORK_NAME,
      });
      loadJobs();
    } catch (error) {
      console.error("Error submitting work:", error);
    } finally {
      setActiveAction(null);
    }
  }

  async function handleCompleteJob(jobId: number) {
    setActiveAction(`completing-${jobId}`);
    try {
      await request("stx_callContract", {
        contract: AGENTIC_COMMERCE,
        functionName: "complete-job",
        functionArgs: [Cl.uint(jobId)],
        network: NETWORK_NAME,
      });
      loadJobs();
    } catch (error) {
      console.error("Error completing job:", error);
    } finally {
      setActiveAction(null);
    }
  }

  async function handleRejectJob(jobId: number) {
    setActiveAction(`rejecting-${jobId}`);
    try {
      await request("stx_callContract", {
        contract: AGENTIC_COMMERCE,
        functionName: "reject-job",
        functionArgs: [Cl.uint(jobId)],
        network: NETWORK_NAME,
      });
      loadJobs();
    } catch (error) {
      console.error("Error rejecting job:", error);
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <div className="container-x py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-mist-500 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Escrow</h1>
          <p className="mt-1.5 text-mist-300">Create and settle agent jobs with trustless STX escrow.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? "btn-ghost" : "btn-primary"} disabled={!!activeAction}>
          {showForm ? "Cancel" : <><Plus className="h-4 w-4" /> Create Job</>}
        </button>
      </div>

      {error && (
        <div className="mt-6 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span>{error}</span>
          <button onClick={loadJobs} className="font-medium underline underline-offset-2">Retry</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateJob} className="card mt-6 p-6">
          <h2 className="text-lg font-semibold">Create New Job</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="field" rows={3} required />
            </div>
            <div>
              <label className="label">Evaluator</label>
              <input type="text" value={formData.evaluator} onChange={(e) => setFormData({ ...formData, evaluator: e.target.value })} className="field font-mono" placeholder="ST…" required />
            </div>
            <div>
              <label className="label">Provider (optional)</label>
              <input type="text" value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} className="field font-mono" placeholder="ST…" />
            </div>
            <div>
              <label className="label">Duration (blocks)</label>
              <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="field" required />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-5" disabled={activeAction === "creating"}>
            {activeAction === "creating" ? "Creating…" : "Create Job"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-400" />
          <p className="mt-3 text-sm text-mist-500">Loading jobs from chain…</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card mt-6 p-12 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-mist-500" strokeWidth={1.5} />
          <p className="mt-3 text-mist-300">No jobs created yet. Create the first one.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="card card-hover p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">Job #{job.id}</h3>
                  <p className="mt-0.5 text-sm text-mist-300">{job.description}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-4">
                <div>
                  <dt className="text-xs text-mist-500">Client</dt>
                  <dd className="truncate font-mono text-xs text-mist-300">{job.client}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mist-500">Provider</dt>
                  <dd className="truncate font-mono text-xs text-mist-300">{job.provider || "Not assigned"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mist-500">Evaluator</dt>
                  <dd className="truncate font-mono text-xs text-mist-300">{job.evaluator}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mist-500">Budget</dt>
                  <dd className="text-white">{job.budget} <span className="text-mist-500">µSTX</span></dd>
                </div>
              </dl>

              {job.escrow !== undefined && job.escrow > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-bitcoin/25 bg-bitcoin/10 px-2.5 py-1 text-xs text-bitcoin-400">
                  Escrow locked: <span className="font-mono">{job.escrow} µSTX</span>
                </div>
              )}

              {actionForm?.jobId === job.id && (
                <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                  {activeAction?.startsWith("setting-budget") && (
                    <div className="flex gap-2">
                      <input type="number" placeholder="Budget in µSTX" value={actionForm.budget || ""} onChange={(e) => setActionForm({ ...actionForm, budget: e.target.value })} className="field flex-1" />
                      <button onClick={() => handleSetBudget(job.id)} className="btn-primary">Set</button>
                      <button onClick={() => setActionForm(null)} className="btn-ghost">Cancel</button>
                    </div>
                  )}
                  {activeAction?.startsWith("assigning-provider") && (
                    <div className="flex gap-2">
                      <input type="text" placeholder="Provider address (ST…)" value={actionForm.provider || ""} onChange={(e) => setActionForm({ ...actionForm, provider: e.target.value })} className="field flex-1 font-mono" />
                      <button onClick={() => handleAssignProvider(job.id)} className="btn-primary">Assign</button>
                      <button onClick={() => setActionForm(null)} className="btn-ghost">Cancel</button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
                {job.status === 0 && (
                  <>
                    <button onClick={() => { setActionForm({ jobId: job.id, budget: "" }); setActiveAction(`setting-budget-${job.id}`); }} className="btn-sm border border-white/[0.12] text-mist-300 hover:text-white">
                      Set Budget
                    </button>
                    {job.budget > 0 && (
                      <button onClick={() => handleFundJob(job.id)} className="btn-sm border border-bitcoin/30 text-bitcoin-400 hover:bg-bitcoin/10" disabled={activeAction === `funding-${job.id}`}>
                        {activeAction === `funding-${job.id}` ? "Funding…" : "Fund Job"}
                      </button>
                    )}
                  </>
                )}
                {job.status === 1 && (
                  <>
                    {!job.provider && (
                      <button onClick={() => { setActionForm({ jobId: job.id, provider: "" }); setActiveAction(`assigning-provider-${job.id}`); }} className="btn-sm border border-white/[0.12] text-mist-300 hover:text-white">
                        Assign Provider
                      </button>
                    )}
                    <button onClick={() => handleSubmitWork(job.id)} className="btn-sm bg-brand text-white hover:bg-brand-600" disabled={activeAction === `submitting-${job.id}`}>
                      {activeAction === `submitting-${job.id}` ? "Submitting…" : "Submit Work"}
                    </button>
                  </>
                )}
                {job.status === 2 && (
                  <>
                    <button onClick={() => handleCompleteJob(job.id)} className="btn-sm border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10" disabled={activeAction === `completing-${job.id}`}>
                      {activeAction === `completing-${job.id}` ? "Completing…" : "Complete"}
                    </button>
                    <button onClick={() => handleRejectJob(job.id)} className="btn-sm border border-red-500/25 text-red-300 hover:bg-red-500/10" disabled={activeAction === `rejecting-${job.id}`}>
                      {activeAction === `rejecting-${job.id}` ? "Rejecting…" : "Reject"}
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
