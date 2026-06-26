'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAgent, getAgentCount, Agent } from "../../services/agent-registry";
import { openContractCall } from "@stacks/connect-react";
import { uintCV, stringAsciiCV, principalCV, optionalCV, someCV, noneCV, listCV, tupleCV } from "@stacks/transactions";
import { CONTRACT_ADDRESS } from "../../constants/contract";
import { NETWORK } from "../../constants/network";

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
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: "agent-registry",
        functionName: "register-agent",
        functionArgs: [
          stringAsciiCV(formData.name),
          stringAsciiCV(formData.description),
          principalCV(formData.wallet),
          listCV([
            tupleCV({
              name: stringAsciiCV(formData.endpointName),
              url: stringAsciiCV(formData.endpointUrl),
            }),
          ]),
        ],
        network: NETWORK,
        appDetails: {
          name: "PerkOS Stacks Agentic Commerce",
          icon: "https://your-icon-url.com/logo.png",
        },
        onFinish: (data) => {
          console.log("Agent registered:", data);
          setShowForm(false);
          setFormData({ name: "", description: "", wallet: "", endpointName: "", endpointUrl: "" });
          setActiveAction(null);
          loadAgents();
        },
        onCancel: () => {
          console.log("Transaction cancelled");
          setActiveAction(null);
        },
      });
    } catch (error) {
      console.error("Error registering agent:", error);
      setActiveAction(null);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAgent) return;
    
    setActiveAction(`updating-${editingAgent.id}`);
    
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: "agent-registry",
        functionName: "update-agent",
        functionArgs: [
          uintCV(editingAgent.id),
          optionalCV(formData.name ? someCV(stringAsciiCV(formData.name)) : noneCV()),
          optionalCV(formData.description ? someCV(stringAsciiCV(formData.description)) : noneCV()),
          optionalCV(formData.wallet ? someCV(principalCV(formData.wallet)) : noneCV()),
        ],
        network: NETWORK,
        appDetails: {
          name: "PerkOS Stacks Agentic Commerce",
          icon: "https://your-icon-url.com/logo.png",
        },
        onFinish: (data) => {
          console.log("Agent updated:", data);
          setEditingAgent(null);
          setFormData({ name: "", description: "", wallet: "", endpointName: "", endpointUrl: "" });
          setActiveAction(null);
          loadAgents();
        },
        onCancel: () => {
          console.log("Transaction cancelled");
          setActiveAction(null);
        },
      });
    } catch (error) {
      console.error("Error updating agent:", error);
      setActiveAction(null);
    }
  }

  async function handleDeactivate(agentId: number) {
    setActiveAction(`deactivating-${agentId}`);
    
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: "agent-registry",
        functionName: "deactivate-agent",
        functionArgs: [uintCV(agentId)],
        network: NETWORK,
        appDetails: {
          name: "PerkOS Stacks Agentic Commerce",
          icon: "https://your-icon-url.com/logo.png",
        },
        onFinish: (data) => {
          console.log("Agent deactivated:", data);
          setActiveAction(null);
          loadAgents();
        },
        onCancel: () => {
          console.log("Transaction cancelled");
          setActiveAction(null);
        },
      });
    } catch (error) {
      console.error("Error deactivating agent:", error);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Agents Registry</h1>
          <p className="text-gray-600">Discover and register AI agents on Stacks.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingAgent(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={!!activeAction}
        >
          {showForm ? "Cancel" : "Register Agent"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={loadAgents} className="ml-4 underline">Retry</button>
        </div>
      )}

      {(showForm || editingAgent) && (
        <form 
          onSubmit={editingAgent ? handleUpdate : handleRegister} 
          className="bg-gray-50 p-6 rounded-lg mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">
            {editingAgent ? "Update Agent" : "Register New Agent"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Wallet Address</label>
              <input
                type="text"
                value={formData.wallet}
                onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="ST..."
                required
              />
            </div>
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
              <label className="block text-sm font-medium mb-1">Endpoint Name</label>
              <input
                type="text"
                value={formData.endpointName}
                onChange={(e) => setFormData({ ...formData, endpointName: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="web, a2a, mcp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Endpoint URL</label>
              <input
                type="url"
                value={formData.endpointUrl}
                onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={activeAction === "registering" || activeAction?.startsWith("updating")}
            >
              {activeAction === "registering" || activeAction?.startsWith("updating")
                ? (editingAgent ? "Updating..." : "Registering...")
                : (editingAgent ? "Update Agent" : "Submit Registration")
              }
            </button>
            {editingAgent && (
              <button
                type="button"
                onClick={() => {
                  setEditingAgent(null);
                  setFormData({ name: "", description: "", wallet: "", endpointName: "", endpointUrl: "" });
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading agents...</p>
        </div>
      ) : agents.length === 0 ? (
        <p className="text-gray-500">No agents registered yet. Be the first!</p>
      ) : (
        <div className="grid gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="border rounded-lg p-4 hover:shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{agent.name}</h3>
                      <p className="text-gray-600 text-sm">{agent.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${agent.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {agent.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    <p><strong>Creator:</strong> {agent.creator}</p>
                    <p><strong>Wallet:</strong> {agent.wallet}</p>
                    {agent.endpoints.length > 0 && (
                      <div className="mt-2">
                        <p><strong>Endpoints:</strong></p>
                        <ul className="list-disc list-inside">
                          {agent.endpoints.map((ep, i) => (
                            <li key={i}>{ep.name}: {ep.url}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => startEdit(agent)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                      disabled={!!activeAction}
                    >
                      Edit
                    </button>
                    {agent.active && (
                      <button
                        onClick={() => handleDeactivate(agent.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                        disabled={activeAction === `deactivating-${agent.id}`}
                      >
                        {activeAction === `deactivating-${agent.id}` ? "Deactivating..." : "Deactivate"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
