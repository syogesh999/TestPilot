import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import {
  FileCode,
  Compass,
  CheckSquare,
  Play,
  TrendingUp,
  Settings,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import ImportSpec from './ImportSpec';
import EndpointExplorer from './EndpointExplorer';
import TestCases from './TestCases';
import LiveRun from './LiveRun';

export default function ProjectDetails() {
  const { id } = useParams();
  const { currentProject, fetchProjectDetails, loading } = useProjectStore();
  const [activeTab, setActiveTab] = useState('explorer');

  useEffect(() => {
    fetchProjectDetails(id);
  }, [id]);

  if (loading || !currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">
        Loading project details...
      </div>
    );
  }

  const { project, spec, testCount, recentRuns } = currentProject;
  const latestRun = recentRuns && recentRuns.length > 0 ? recentRuns[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {spec ? `OpenAPI ${spec.version}` : 'No Spec Uploaded'}
            </span>
          </div>
          <p className="text-sm text-gray-400">{project.description || 'API Testing Project'}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('import')}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition-all"
          >
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>Import Spec</span>
          </button>

          <button
            onClick={() => setActiveTab('run')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Test Suite</span>
          </button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Endpoints Discovered</p>
          <p className="text-2xl font-bold text-white">{spec?.endpointsCount || 0}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Generated Tests</p>
          <p className="text-2xl font-bold text-white">{testCount || 0}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Latest Quality Score</p>
          <p className="text-2xl font-bold text-indigo-400">
            {latestRun?.summary?.qualityScore !== undefined ? `${latestRun.summary.qualityScore} / 100` : 'N/A'}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-gray-800 space-y-1">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Latest Execution Status</p>
          <p className="text-2xl font-bold text-emerald-400">
            {latestRun ? latestRun.status : 'No Runs Yet'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 flex space-x-6">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'explorer'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Endpoint Explorer</span>
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'tests'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Test Generator & Cases ({testCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('run')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'run'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Execute Suite</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'import'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Import Spec</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'explorer' && <EndpointExplorer projectId={project._id} />}
        {activeTab === 'tests' && <TestCases projectId={project._id} />}
        {activeTab === 'run' && <LiveRun projectId={project._id} />}
        {activeTab === 'import' && <ImportSpec projectId={project._id} onImportSuccess={() => setActiveTab('explorer')} />}
      </div>
    </div>
  );
}
