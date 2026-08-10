import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { Compass, Shield, Search, ChevronRight, FileCode, CheckCircle } from 'lucide-react';

export default function EndpointExplorer({ projectId }) {
  const { endpoints, fetchEndpoints } = useProjectStore();
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEndpoints(projectId);
  }, [projectId]);

  useEffect(() => {
    if (endpoints && endpoints.length > 0 && !selectedEndpoint) {
      setSelectedEndpoint(endpoints[0]);
    }
  }, [endpoints]);

  const filteredEndpoints = (endpoints || []).filter(
    (e) =>
      e.path.toLowerCase().includes(search.toLowerCase()) ||
      e.method.toLowerCase().includes(search.toLowerCase()) ||
      e.summary.toLowerCase().includes(search.toLowerCase())
  );

  const getMethodBadgeClass = (method) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'POST':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELETE':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Endpoint List Sidebar */}
      <div className="lg:col-span-5 glass-panel p-4 rounded-2xl border border-gray-800 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search endpoints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 pl-9 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredEndpoints.length === 0 ? (
            <p className="text-center py-8 text-xs text-gray-500">No endpoints found.</p>
          ) : (
            filteredEndpoints.map((ep) => (
              <button
                key={ep.id}
                onClick={() => setSelectedEndpoint(ep)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                  selectedEndpoint?.id === ep.id
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                    : 'bg-gray-900/40 border-gray-800/80 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodBadgeClass(
                      ep.method
                    )}`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-xs font-mono font-medium truncate">{ep.path}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Selected Endpoint Inspector */}
      <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
        {selectedEndpoint ? (
          <>
            {/* Header */}
            <div className="border-b border-gray-800 pb-4 space-y-2">
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${getMethodBadgeClass(
                    selectedEndpoint.method
                  )}`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="text-lg font-mono font-bold text-white">{selectedEndpoint.path}</span>
              </div>
              <p className="text-xs text-gray-400">{selectedEndpoint.summary}</p>
            </div>

            {/* Parameters */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Parameters ({selectedEndpoint.parameters?.length || 0})
              </h4>
              {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 ? (
                <div className="bg-gray-900/80 rounded-xl border border-gray-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-950 text-gray-400 font-semibold border-b border-gray-800">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">In</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 text-gray-300">
                      {selectedEndpoint.parameters.map((p, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-mono font-medium text-white">{p.name}</td>
                          <td className="p-3 text-indigo-400 font-mono">{p.in}</td>
                          <td className="p-3 text-gray-400 font-mono">{p.schema?.type || 'string'}</td>
                          <td className="p-3">
                            {p.required ? (
                              <span className="text-amber-400 font-semibold">Yes</span>
                            ) : (
                              <span className="text-gray-500">No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No parameters declared for this endpoint.</p>
              )}
            </div>

            {/* Request Body Schema */}
            {selectedEndpoint.requestBody && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Request Body Schema ({selectedEndpoint.requestBody.mediaType})
                  </h4>
                  {selectedEndpoint.requestBody.required && (
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                      Required
                    </span>
                  )}
                </div>
                <pre className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs font-mono text-indigo-300 overflow-x-auto max-h-60">
                  {JSON.stringify(selectedEndpoint.requestBody.schema, null, 2)}
                </pre>
              </div>
            )}

            {/* Response Schemas */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Response Schemas & Status Codes
              </h4>
              <div className="space-y-3">
                {Object.entries(selectedEndpoint.responses || {}).map(([code, resp]) => (
                  <div key={code} className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-800 text-emerald-400">
                        HTTP {code}
                      </span>
                      <span className="text-xs text-gray-400">{resp.description}</span>
                    </div>
                    {resp.schema && (
                      <pre className="bg-gray-950 p-3 rounded-lg text-[11px] font-mono text-gray-300 overflow-x-auto max-h-40">
                        {JSON.stringify(resp.schema, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-gray-500 text-sm">
            Select an endpoint to inspect detailed contract schema.
          </div>
        )}
      </div>
    </div>
  );
}
