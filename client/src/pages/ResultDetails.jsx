import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Clock, Terminal } from 'lucide-react';

export default function ResultDetails() {
  const { runId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await api.get(`/runs/${runId}/results`);
        setResults(res.data.results || []);
        if (res.data.results && res.data.results.length > 0) {
          setSelectedResult(res.data.results[0]);
        }
      } catch (err) {}
      setLoading(false);
    }
    loadResults();
  }, [runId]);

  const filteredResults = results.filter((r) => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to={`/runs/${runId}/report`}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Test Run Result Inspector</h1>
            <p className="text-xs text-gray-400 font-mono">Run ID: {runId}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterStatus === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            All ({results.length})
          </button>
          <button
            onClick={() => setFilterStatus('FAIL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterStatus === 'FAIL' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            Failures ({results.filter((r) => r.status === 'FAIL').length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Results Sidebar */}
        <div className="lg:col-span-5 glass-panel p-4 rounded-2xl border border-gray-800 space-y-2 max-h-[700px] overflow-y-auto">
          {filteredResults.map((r) => (
            <button
              key={r._id}
              onClick={() => setSelectedResult(r)}
              className={`w-full text-left p-3 rounded-xl border transition-all space-y-1.5 ${
                selectedResult?._id === r._id
                  ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                  : 'bg-gray-900/40 border-gray-800 text-gray-300 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    r.status === 'PASS'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {r.status}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">{r.durationMs} ms</span>
              </div>
              <p className="text-xs font-medium text-white truncate">
                {r.testCaseId?.description || 'Test Case'}
              </p>
              <p className="text-[10px] font-mono text-gray-400">
                {r.requestMeta?.method} {r.requestMeta?.url}
              </p>
            </button>
          ))}
        </div>

        {/* Detailed Result Inspector */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
          {selectedResult ? (
            <>
              <div className="border-b border-gray-800 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{selectedResult.testCaseId?.description}</h3>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      selectedResult.status === 'PASS'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {selectedResult.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{selectedResult.testCaseId?.reason}</p>
              </div>

              {/* Status Code Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Expected Status</p>
                  <p className="text-lg font-mono font-bold text-indigo-400">
                    HTTP {selectedResult.testCaseId?.expectedResponse?.statusCode}
                  </p>
                </div>
                <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Actual Target Response</p>
                  <p
                    className={`text-lg font-mono font-bold ${
                      selectedResult.statusCode === selectedResult.testCaseId?.expectedResponse?.statusCode
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    HTTP {selectedResult.statusCode || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Failures & Assertions */}
              {selectedResult.failures && selectedResult.failures.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center space-x-1">
                    <XCircle className="w-4 h-4" />
                    <span>Failed Assertions</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedResult.failures.map((f, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1">
                        <p className="font-semibold">{f.message}</p>
                        {f.expected !== undefined && (
                          <p className="font-mono text-[11px] text-red-400">
                            Expected: {JSON.stringify(f.expected)} | Actual: {JSON.stringify(f.actual)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Payload */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Request Metadata & Body
                </h4>
                <pre className="bg-gray-950 p-4 rounded-xl text-xs font-mono text-indigo-300 border border-gray-800 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedResult.requestMeta, null, 2)}
                </pre>
              </div>

              {/* Response Payload */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Actual Target Response Body
                </h4>
                <pre className="bg-gray-950 p-4 rounded-xl text-xs font-mono text-emerald-300 border border-gray-800 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedResult.responseMeta?.body, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-gray-500">Select a result to inspect</div>
          )}
        </div>
      </div>
    </div>
  );
}
