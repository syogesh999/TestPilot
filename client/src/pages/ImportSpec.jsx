import React, { useState } from 'react';
import api from '../services/api';
import { useProjectStore } from '../stores/projectStore';
import { FileCode, CheckCircle2, AlertTriangle, Upload, Sparkles } from 'lucide-react';

const SAMPLE_YAML = `openapi: 3.0.3
info:
  title: Sample E-Commerce API
  version: 1.0.0
servers:
  - url: http://localhost:4000/api
paths:
  /auth/login:
    post:
      summary: Authenticate user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email: { type: string, format: email }
                password: { type: string }
      responses:
        '200': { description: Success }
        '400': { description: Missing fields }
        '401': { description: Invalid credentials }
  /users:
    get:
      summary: List users
      responses:
        '200': { description: OK }
    post:
      summary: Create User
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, email]
              properties:
                name: { type: string, minLength: 2 }
                email: { type: string, format: email }
                age: { type: integer, minimum: 18, maximum: 100 }
                role: { type: string, enum: [admin, user, guest] }
      responses:
        '201': { description: Created }
        '400': { description: Invalid payload }
  /products:
    get:
      summary: List Products
      security: [{ BearerAuth: [] }]
      responses:
        '200': { description: OK }
        '401': { description: Unauthorized }
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
`;

export default function ImportSpec({ projectId, onImportSuccess }) {
  const [specContent, setSpecContent] = useState(SAMPLE_YAML);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const { fetchProjectDetails } = useProjectStore();

  const handleImport = async (e) => {
    e.preventDefault();
    if (!specContent) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post(`/projects/${projectId}/specs`, { specContent });
      setResult(res.data);
      await fetchProjectDetails(projectId);
      if (onImportSuccess) {
        setTimeout(() => onImportSuccess(), 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to parse and import OpenAPI specification');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSpecContent(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <span>Import OpenAPI Specification</span>
          </h2>
          <p className="text-sm text-gray-400">
            Paste or upload OpenAPI 3.x / Swagger specification document in JSON or YAML format.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 cursor-pointer transition-all border border-gray-700">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Upload File (.json / .yaml)</span>
            <input type="file" accept=".json,.yaml,.yml" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => setSpecContent(SAMPLE_YAML)}
            className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 font-medium px-3.5 py-2 rounded-xl text-xs border border-indigo-500/20 flex items-center space-x-1 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample E-Commerce Spec</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Specification Import Error</p>
            <p className="text-xs text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">OpenAPI Specification Imported Successfully!</p>
            <p className="text-xs text-emerald-300 mt-0.5">
              Extracted {result.endpointCount} endpoints across version {result.version} ({result.format.toUpperCase()}).
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleImport} className="space-y-4">
        <div className="relative">
          <textarea
            rows="16"
            required
            value={specContent}
            onChange={(e) => setSpecContent(e.target.value)}
            className="w-full bg-gray-950 font-mono text-xs text-gray-200 border border-gray-800 rounded-xl p-4 focus:outline-none focus:border-indigo-500 leading-relaxed"
            placeholder="Paste openapi.yaml or openapi.json here..."
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-sm disabled:opacity-50"
          >
            {loading ? 'Validating & Importing...' : 'Validate & Import Specification'}
          </button>
        </div>
      </form>
    </div>
  );
}
