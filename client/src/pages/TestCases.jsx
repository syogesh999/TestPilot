import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useProjectStore } from '../stores/projectStore';
import { CheckSquare, Sparkles, Filter, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export default function TestCases({ projectId }) {
  const { tests, fetchTests } = useProjectStore();
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  useEffect(() => {
    fetchTests(projectId);
  }, [projectId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenResult(null);
    try {
      const res = await api.post(`/projects/${projectId}/tests/generate`);
      setGenResult(res.data);
      await fetchTests(projectId);
    } catch (err) {
      alert(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const filteredTests = tests.filter((t) => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'HIGH':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'LOW':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
      {/* Header & Generation Trigger */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span>Deterministic Test Cases ({tests.length})</span>
          </h2>
          <p className="text-sm text-gray-400">
            Engine generated suite combining functional, required field, type mutation, boundary, enum, and auth checks.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 text-xs disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generating ? 'Generating Test Suite...' : 'Generate Deterministic Tests'}</span>
        </button>
      </div>

      {genResult && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>Generated {genResult.totalGenerated} tests automatically across 7 categories.</span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-semibold text-gray-300 uppercase">Filters:</span>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none"
        >
          <option value="ALL">All Test Types</option>
          <option value="HAPPY_PATH">Happy Path</option>
          <option value="REQUIRED_FIELD">Required Field</option>
          <option value="TYPE_VALIDATION">Type Validation</option>
          <option value="BOUNDARY">Boundary Value</option>
          <option value="ENUM">Enum Constraint</option>
          <option value="AUTHENTICATION">Authentication</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Test Cases Table */}
      {filteredTests.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No test cases found matching selected filters. Click "Generate Deterministic Tests" above.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-gray-400 font-semibold border-b border-gray-800">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Description</th>
                <th className="p-3">Target Method & Endpoint</th>
                <th className="p-3">Expected Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {filteredTests.map((tc) => (
                <tr key={tc._id} className="hover:bg-gray-900/40">
                  <td className="p-3 font-mono">
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-200 border border-gray-700">
                      {tc.type}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadgeClass(
                        tc.priority
                      )}`}
                    >
                      {tc.priority}
                    </span>
                  </td>
                  <td className="p-3 space-y-0.5">
                    <p className="font-medium text-white">{tc.description}</p>
                    <p className="text-[11px] text-gray-400 line-clamp-1">{tc.reason}</p>
                  </td>
                  <td className="p-3 font-mono text-indigo-400">
                    {tc.request.method} {tc.request.path}
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-400">
                    HTTP {tc.expectedResponse.statusCode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
