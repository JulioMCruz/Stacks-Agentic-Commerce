'use client';

import { useState, useEffect } from "react";
import { Reputation, getReputation, rateAgent } from "../../services/reputation";
import { Verification, getVerification } from "../../services/validation";
import TransactionButton from "../../components/TransactionButton";

interface AgentProfileProps {
  agentAddress: string;
  agentName: string;
}

export default function AgentProfile({ agentAddress, agentName }: AgentProfileProps) {
  const [reputation, setReputation] = useState<Reputation | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    score: 5,
    jobId: 1,
    comment: "",
  });

  useEffect(() => {
    loadAgentData();
  }, [agentAddress]);

  async function loadAgentData() {
    setLoading(true);
    try {
      const [repData, verData] = await Promise.all([
        getReputation(agentAddress),
        getVerification(agentAddress),
      ]);
      setReputation(repData);
      setVerification(verData);
    } catch (error) {
      console.error("Error loading agent data:", error);
    }
    setLoading(false);
  }

  async function handleRateAgent() {
    try {
      await rateAgent(agentAddress, ratingForm.score, ratingForm.jobId, ratingForm.comment);
      setShowRatingForm(false);
      loadAgentData();
    } catch (error) {
      console.error("Error rating agent:", error);
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{agentName}</h3>
          <p className="text-sm text-gray-500 font-mono">{agentAddress}</p>
        </div>
        <div className="flex gap-2">
          {verification?.isVerified && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              ✅ Verified
            </span>
          )}
          {reputation && reputation.ratingCount > 0 && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
              ⭐ {reputation.averageScore.toFixed(1)}/5
            </span>
          )}
        </div>
      </div>

      {/* Reputation Stats */}
      {reputation && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{reputation.completedJobs}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{reputation.disputedJobs}</p>
            <p className="text-sm text-gray-500">Disputed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{reputation.ratingCount}</p>
            <p className="text-sm text-gray-500">Ratings</p>
          </div>
        </div>
      )}

      {/* Capabilities */}
      {verification?.capabilities && verification.capabilities.length > 0 && (
        <div className="mb-4">
          <p className="font-semibold mb-2">Capabilities:</p>
          <div className="flex flex-wrap gap-2">
            {verification.capabilities.map((cap, i) => (
              <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rating Form */}
      {showRatingForm && (
        <div className="bg-gray-50 p-4 rounded mb-4">
          <h4 className="font-semibold mb-3">Rate Agent</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Score (1-5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={ratingForm.score}
                onChange={(e) => setRatingForm({ ...ratingForm, score: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1⭐</span>
                <span>{ratingForm.score}⭐</span>
                <span>5⭐</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comment</label>
              <textarea
                value={ratingForm.comment}
                onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <TransactionButton
                onClick={handleRateAgent}
                variant="primary"
              >
                Submit Rating
              </TransactionButton>
              <button
                onClick={() => setShowRatingForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setShowRatingForm(!showRatingForm)}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          ⭐ Rate Agent
        </button>
        <button
          onClick={loadAgentData}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
