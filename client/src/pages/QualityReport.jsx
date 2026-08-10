import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  BarChart3,
  Layers,
  ArrowRight,
  Cpu,
} from 'lucide-react';

export default function QualityReport() {
  const { runId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await api.get(`/runs/${runId}/report`);
        setReportData(res.data);
        if (res.data.aiReport) {
          setAiReport(res.data.aiReport);
        }
      } catch (err) {}
      setLoading(false);
    }
    loadReport();
  }, [runId]);

  const handleRunAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post(`/runs/${runId}/ai-analysis`);
      setAiReport(res.data);
    } catch (err) {
      alert(err.message || 'AI Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !reportData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">
        Loading Quality Engineering Report...
      </div>
    );
  }

  const { run } = reportData;
  const { summary } = run;
  const categories = summary.categoryScores || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">API Quality Engineering Report</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">Run ID: {runId}</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/runs/${runId}/results`}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition-all"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Inspect Failure Details</span>
          </Link>

          <button
            onClick={handleRunAIAnalysis}
            disabled={analyzing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{analyzing ? 'Analyzing with AI...' : 'AI ANALYZE REPORT'}</span>
          </button>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 glass-panel p-8 rounded-2xl border border-indigo-500/30 text-center flex flex-col justify-center items-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Overall API Quality Score
          </p>
          <div className="relative">
            <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-500">
              {summary.qualityScore}
            </span>
            <span className="text-xl text-gray-500 font-bold"> / 100</span>
          </div>

          <div className="w-full bg-gray-900 rounded-full h-3 overflow-hidden border border-gray-800">
            <div
              className="bg-gradient-to-r from-indigo-600 to-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${summary.qualityScore}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full pt-2 text-xs">
            <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
              <span className="block font-bold text-emerald-400">{summary.passed}</span>
              <span className="text-[10px] text-gray-400">Passed</span>
            </div>
            <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
              <span className="block font-bold text-red-400">{summary.failed}</span>
              <span className="text-[10px] text-gray-400">Failed</span>
            </div>
            <div className="bg-gray-900/80 p-2 rounded-lg border border-gray-800">
              <span className="block font-bold text-amber-400">{summary.error}</span>
              <span className="text-[10px] text-gray-400">Errors</span>
            </div>
          </div>
        </div>

        {/* Weighted Category Meters */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Weighted Category Breakdown</span>
          </h3>

          <div className="space-y-4 text-xs">
            {[
              { label: 'Functional Coverage (30%)', value: categories.functional || 0, color: 'bg-indigo-500' },
              { label: 'Contract Validation (25%)', value: categories.contract || 0, color: 'bg-emerald-500' },
              { label: 'Negative Coverage (15%)', value: categories.negative || 0, color: 'bg-purple-500' },
              { label: 'Boundary Value (10%)', value: categories.boundary || 0, color: 'bg-blue-500' },
              { label: 'Security Checks (10%)', value: categories.security || 0, color: 'bg-amber-500' },
              { label: 'Execution Success (10%)', value: categories.execution || 0, color: 'bg-rose-500' },
            ].map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-300">{cat.label}</span>
                  <span className="text-white font-mono font-bold">{cat.value}%</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-2 border border-gray-800 overflow-hidden">
                  <div
                    className={`${cat.color} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${cat.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Intelligence Report */}
      {aiReport && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/40 space-y-6 bg-indigo-950/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Analysis & Recommended Actions</h3>
              <p className="text-xs text-gray-400">Generated via {aiReport.provider} provider</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 text-xs text-gray-300 leading-relaxed">
            {aiReport.summary}
          </div>

          {/* Probable Causes & Developer Recommendations */}
          {aiReport.probableCauses && aiReport.probableCauses.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Root Cause & Developer Guidance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiReport.probableCauses.map((pc, idx) => (
                  <div key={idx} className="bg-gray-900/90 p-4 rounded-xl border border-gray-800 space-y-2 text-xs">
                    <p className="font-mono font-bold text-indigo-400">{pc.endpoint}</p>
                    <p className="text-red-300 font-medium">{pc.issue}</p>
                    <p className="text-emerald-300 text-[11px] bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                      💡 {pc.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
