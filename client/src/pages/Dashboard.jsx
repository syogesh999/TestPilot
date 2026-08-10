import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import {
  FolderPlus,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Sparkles,
  Layers,
  Zap,
} from 'lucide-react';

export default function Dashboard() {
  const { projects, fetchProjects, createProject, loading } = useProjectStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseUrl, setBaseUrl] = useState('http://localhost:4000');

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    const proj = await createProject(name, description, baseUrl);
    if (proj) {
      setShowModal(false);
      setName('');
      setDescription('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900 via-indigo-950/30 to-gray-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">API Quality Dashboard</h1>
          </div>
          <p className="text-sm text-gray-400">
            Convert OpenAPI contracts into executable functional, negative, boundary, and security test suites.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Monitored API Projects ({projects.length})</span>
          </h2>
        </div>

        {loading && projects.length === 0 ? (
          <div className="p-12 text-center text-gray-500 glass-panel rounded-2xl">
            Loading API projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-dashed border-gray-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">No Projects Found</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Create a project and import an OpenAPI 3.x document to start generating deterministic API test suites.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj._id}
                className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {proj.name}
                    </h3>
                    {proj.hasSpec ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>OpenAPI Spec</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>No Spec</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                {/* Score & Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800/80">
                  <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Test Suite</p>
                    <p className="text-lg font-bold text-white">{proj.testCount || 0} Cases</p>
                  </div>
                  <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Quality Score</p>
                    <p className="text-lg font-bold text-indigo-400">
                      {proj.latestRun?.qualityScore !== undefined ? `${proj.latestRun.qualityScore} / 100` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Link
                    to={`/projects/${proj._id}`}
                    className="w-full text-center bg-gray-800 hover:bg-indigo-600 hover:text-white text-gray-300 font-medium py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-1"
                  >
                    <span>View Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 max-w-lg w-full space-y-4">
            <h3 className="text-xl font-bold text-white">Create New API Project</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. E-Commerce Core API"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of the API service"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Target Base URL
                </label>
                <input
                  type="text"
                  required
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:4000"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-sm shadow-md shadow-indigo-600/20"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
