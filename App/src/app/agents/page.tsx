'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Power, Fingerprint } from "lucide-react";
import { getAgent, getAgentCount, Agent } from "../../services/agent-registry";
import { request } from "@stacks/connect";
import { Cl } from "@stacks/transactions";
import { CONTRACT_ADDRESS } from "../../constants/contract";
import { NETWORK_NAME } from "../../constants/network";

const AGENT_REGISTRY = `${CONTRACT_ADDRESS}.agent-registry` as `${string}.${string}`;

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    wallet: "",
    endpointName: "",
    endpointUrl: "",
  });

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    setLoading(true);
    setError(null);
    try {
      const count = await getAgentCount();
      const agentList: Agent[] = [];
      for (let i = 1; i <= count; i++) {
        const agent = await getAgent(i);
        if (agent) agentList.push(agent);
      }
      setAgents(agentList);
    } catch (error) {
      console.error("Error loading agents:", error);
      setError("Failed to load agents. Please try again.");
    }
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setActiveAction("registering");

    try {
      await request("stx_callContract", {
        contract: AGENT_REGISTRY,
        functionName: "register-agent",
        functionArgs: [
          Cl.stringAscii(formData.name),
          Cl.stringAscii(formData.description),
          Cl.principal(formData.wallet),
          Cl.list([
            Cl.tuple({
              name: Cl.stringAscii(formData.endpointName),
              url: Cl.stringAscii(formData.endpointUrl),
            }),
          ]),
        ],
        network: NETWORK_NAME,
      });
      setShowForm(false);
      setFormData({ name: "", description: "", wallet: "", endpointName: "", endpointUrl: "" });
      loadAgents();
    } catch (error) {
      console.error("Error registering agent:", error);
    } finally {
      setActiveAction(null);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAgent) return;

    setActiveAction(`updating-${editingAgent.id}`);

    try {
      await request("stx_callContract", {
        contract: AGENT_REGISTRY,
        functionName: "update-agent",
        functionArgs: [
          Cl.uint(editingAgent.id),
          formData.name ? Cl.some(Cl.stringAscii(formData.name)) : Cl.none(),
          formData.description ? Cl.some(Cl.stringAscii(formData.description)) : Cl.none(),
          formData.wallet ? Cl.some(Cl.principal(formData.wallet)) : Cl.none(),
        ],
        network: NETWORK_NAME,
      });
      setEditingAgent(null);
      setFormData({ name: "", description: "", wallet: "", endpointName: "", endpointUrl: "" });
      loadAgents();
    } catch (error) {
      console.error("Error updating agent:", error);
    } finally {
      setActiveAction(null);
    }
  }

  async function handleDeactivate(agentId: number) {
    setActiveAction(`deactivating-${agentId}`);

    try {
      await request("stx_callContract", {
        contract: AGENT_REGISTRY,
        functionName: "deactivate-agent",
        functionArgs: [Cl.uint(agentId)],
        network: NETWORK_NAME,
      });
      loadAgents();
    } catch (error) {
      console.error("Error deactivating agent:", error);
    } finally {
      setActiveAction(null);
    }
  }

  function startEdit(agent: Agent) {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      wallet: agent.wallet,
      endpointName: agent.endpoints[0]?.name || "",
      endpointUrl: agent.endpoints[0]?.url || "",
    });
  }

  const submitting = activeAction === "registering" || activeAction?.startsWith("updating");

  return (
    <div className="container-x py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-mist-500 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Registry</h1>
          <p className="mt-1.5 text-mist-300">On-chain identity for autonomous agents on Stacks.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingAgent(null); }}
          className={showForm ? "btn-ghost" : "btn-primary"}
          disabled={!!activeAction}
        >
          {showForm ? "Cancel" : <><Plus className="h-4 w-4" /> Register Agent</>}
        </button>
      </div>

      {error && (
        <div className="mt-6 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span>{error}</span>
          <button onClick={loadAgents} className="font-medium underline underline-offset-2">Retry</button>
        </div>
      )}

      {(showForm || editingAgent) && (
        <form onSubmit={editingAgent ? handleUpdate : handleRegister} className="card mt-6 p-6">
          <h2 className="text-lg font-semibold">{editingAgent ? "Update Agent" : "Register New Agent"}</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="field" required />
            </div>
            <div>
              <label className="label">Wallet Address</label>
              <input type="text" value={formData.wallet} onChange={(e) => setFormData({ ...formData, wallet: e.target.value })} className="field font-mono" placeholder="ST…" required />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="field" rows={3} required />
            </div>
            <div>
              <label className="label">Endpoint Name</label>
              <input type="text" value={formData.endpointName} onChange={(e) => setFormData({ ...formData, endpointName: e.target.value })} className="field" placeholder="web, a2a, mcp" />
            </div>
            <div>
              <label className="label">Endpoint URL</label>
              <input type="url" value={formData.endpointUrl} onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })} className="field" placeholder="https://…" />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (editingAgent ? "Updating…" : "Registering…") : (editingAgent ? "Update Agent" : "Submit Registration")}
            </button>
            {editingAgent && (
              <button
                type="button"
                onClick={() => { setEditingAgent(null); setFormData({ name: "", description: "", wallet: "", endpointName: "", endpointUrl: "" }); }}
                className="btn-ghost"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-400" />
          <p className="mt-3 text-sm text-mist-500">Loading agents from chain…</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="card mt-6 p-12 text-center">
          <Fingerprint className="mx-auto h-8 w-8 text-mist-500" strokeWidth={1.5} />
          <p className="mt-3 text-mist-300">No agents registered yet. Be the first.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="card card-hover p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand-300">
                    <Fingerprint className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{agent.name}</h3>
                    <p className="mt-0.5 text-sm text-mist-300">{agent.description}</p>
                  </div>
                </div>
                <span className={`badge ${agent.active ? "border-emerald-500/30 text-emerald-300" : "border-white/10 text-mist-500"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${agent.active ? "bg-emerald-400" : "bg-mist-500"}`} />
                  {agent.active ? "Active" : "Inactive"}
                </span>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                <div className="flex gap-2"><dt className="text-mist-500">Creator</dt><dd className="truncate font-mono text-xs text-mist-300">{agent.creator}</dd></div>
                <div className="flex gap-2"><dt className="text-mist-500">Wallet</dt><dd className="truncate font-mono text-xs text-mist-300">{agent.wallet}</dd></div>
              </dl>
              {agent.endpoints.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {agent.endpoints.map((ep, i) => (
                    <span key={i} className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-1 text-xs text-mist-300">
                      <span className="text-mist-500">{ep.name}:</span> {ep.url}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2 border-t border-white/[0.06] pt-4">
                <button onClick={() => startEdit(agent)} className="btn-sm border border-white/[0.12] text-mist-300 hover:text-white" disabled={!!activeAction}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                {agent.active && (
                  <button onClick={() => handleDeactivate(agent.id)} className="btn-sm border border-red-500/25 text-red-300 hover:bg-red-500/10" disabled={activeAction === `deactivating-${agent.id}`}>
                    <Power className="h-3.5 w-3.5" /> {activeAction === `deactivating-${agent.id}` ? "Deactivating…" : "Deactivate"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
