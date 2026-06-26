'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAgent, getAgentCount, Agent } from "../../services/agent-registry";
import { openContractCall } from "@stacks/connect-react";
import { uintCV, stringAsciiCV, principalCV, listCV, tupleCV } from "@stacks/transactions";
import { CONTRACT_ADDRESS, AGENT_REGISTRY_CONTRACT } from "../../constants/contract";
import { NETWORK } from "../../constants/network";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
    }
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    
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
          name: "Stacks Agentic Commerce",
          icon: "https://your-icon-url.com/logo.png",
        },
        onFinish: (data) => {
          console.log("Transaction submitted:", data);
          setShowForm(false);
          loadAgents();
        },
        onCancel: () => {
          console.log("Transaction cancelled");
        },
      });
    } catch (error) {
      console.error("Error registering agent:", error);
    }
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
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Register Agent"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleRegister} className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Register New Agent</h2>
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
          <button
            type="submit"
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Submit Registration
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading agents...</p>
      ) : agents.length === 0 ? (
        <p className="text-gray-500">No agents registered yet. Be the first!</p>
      ) : (
        <div className="grid gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="border rounded-lg p-4 hover:shadow-md">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
