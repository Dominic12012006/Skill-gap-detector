import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Compass, ArrowRight, UserCheck, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await api.register(name, email, password);
        navigate('/onboarding');
      } else {
        await api.login(email, password);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async (demoEmail: string, isColdStart = false) => {
    setLoading(true);
    setError('');
    try {
      await api.login(demoEmail, 'password123');
      if (isColdStart) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-md mb-3">
          <Compass className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Learning Platform Skill Gap Identifier
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Closed-Loop Competency Modeling • Explainable Diagnostics • Targeted Mastery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {/* Quick Demo Student Selector Buttons */}
          <div className="mb-6 bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block mb-2 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Instant Evaluation Personas
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => loginAsDemo('alex@example.com')}
                className="w-full text-left p-2.5 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 hover:shadow-xs transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block">Alex Rivera (Seeded Profile)</span>
                  <span className="text-slate-500">Struggling in Gradient Descent (43% mastery, 91% conf)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => loginAsDemo('dominic@example.com', true)}
                className="w-full text-left p-2.5 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 hover:shadow-xs transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block">Dominic Chen (Cold-Start)</span>
                  <span className="text-slate-500">New student • Launch diagnostic onboarding</span>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">Or enter credentials</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Gonzalez"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Create Account & Begin Diagnostic' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

