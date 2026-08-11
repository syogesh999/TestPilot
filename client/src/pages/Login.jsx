import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Cpu, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('demo@testpilot.io');
  const [password, setPassword] = useState('SecretPass123!');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleDemoRegisterAndLogin = async () => {
    let success = await login('demo@testpilot.io', 'SecretPass123!');
    if (!success) {
      const { register } = useAuthStore.getState();
      await register('Demo Engineer', 'demo@testpilot.io', 'SecretPass123!');
      success = await login('demo@testpilot.io', 'SecretPass123!');
    }
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/10 text-indigo-400 mb-2 border border-indigo-500/20">
            <Cpu className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to TestPilot</h2>
          <p className="text-sm text-gray-400">AI-Powered API Quality Engineering Platform</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl px-4 py-2.5 pl-10 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl px-4 py-2.5 pl-10 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="flex-shrink mx-4 text-xs uppercase text-gray-500 font-semibold tracking-wider">
            Quick Start Demo
          </span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        <button
          onClick={handleDemoRegisterAndLogin}
          className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 text-sm"
        >
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Launch instant Demo Workspace</span>
        </button>

        <p className="text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
