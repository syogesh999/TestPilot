import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Play, CheckCircle2, Clock, Loader2, ArrowRight, ShieldCheck, Server } from 'lucide-react';

export default function LiveRun({ projectId }) {
  const [environments, setEnvironments] = useState([]);
  const [selectedEnv, setSelectedEnv] = useState('');
  const [token, setToken] = useState('sample_jwt_token_admin_2026');
  const [running, setRunning] = useState(false);
  const [runData, setRunData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEnvironments() {
      try {
        const res = await api.get(`/projects/${projectId}/environments`);
        setEnvironments(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedEnv(res.data[0]._id);
        }
      } catch (err) {}
    }
    loadEnvironments();
  }, [projectId]);

  const handleStartRun = async () => {
    if (!selectedEnv) return;

    setRunning(true);
    try {
      // Create TestRun (QUEUED)
      const res = await api.post('/runs', {
        projectId,
        environmentId: selectedEnv,
      });

      const { runId } = res.data;
      setRunData({ runId, status: 'QUEUED' });

      // Poll status until COMPLETED or FAILED
      const interval = setInterval(async () => {
        try {
          const statusRes = await api.get(`/runs/${runId}`);
          const current = statusRes.data;
          setRunData(current);

          if (current.status === 'COMPLETED' || current.status === 'FAILED') {
            clearInterval(interval);
            setRunning(false);
          }
        } catch (e) {
          clearInterval(interval);
          setRunning(false);
        }
      }, 1000);
    } catch (err) {
      alert(err.message || 'Failed to launch test run');
      setRunning(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Play className="w-5 h-5 text-indigo-400" />
            <span>Execute Test Suite (Playwright Engine)</span>
          </h2>
          <p className="text-sm text-gray-400">
            Execute all generated API test cases asynchronously against authorized target environment.
          </p>
        </div>

        <button
          onClick={handleStartRun}
          disabled={running || !selectedEnv}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2 text-sm disabled:opacity-50"
        >
          {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
          <span>{running ? 'Executing Suite...' : 'RUN TESTS NOW'}</span>
        </button>
      </div>

      {/* Environment & Token Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
            Target Environment
          </label>
          <select
            value={selectedEnv}
            onChange={(e) => setSelectedEnv(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded-xl p-2.5 focus:outline-none"
          >
            {environments.map((env) => (
              <option key={env._id} value={env._id}>
                {env.name} ({env.baseUrl})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
            Environment Authorization Token (Bearer)
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="sample_jwt_token_admin_2026"
            className="w-full bg-gray-900 border border-gray-700 text-white text-xs font-mono rounded-xl p-2.5 focus:outline-none"
          />
        </div>
      </div>

      {/* Live Run Execution Status */}
      {runData && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {runData.status === 'RUNNING' && <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />}
              {runData.status === 'COMPLETED' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
              <div>
                <h3 className="text-lg font-bold text-white">Execution Status: {runData.status}</h3>
                <p className="text-xs text-gray-400">Run ID: {runData._id || runData.runId}</p>
              </div>
            </div>

            {runData.status === 'COMPLETED' && (
              <button
                onClick={() => navigate(`/runs/${runData._id}/report`)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 shadow-md shadow-emerald-600/20"
              >
                <span>View Quality Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {runData.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Cases</p>
                <p className="text-xl font-bold text-white">{runData.summary.total}</p>
              </div>
              <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Passed</p>
                <p className="text-xl font-bold text-emerald-400">{runData.summary.passed}</p>
              </div>
              <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Failed</p>
                <p className="text-xl font-bold text-red-400">{runData.summary.failed}</p>
              </div>
              <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Quality Score</p>
                <p className="text-xl font-bold text-indigo-400">{runData.summary.qualityScore} / 100</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
