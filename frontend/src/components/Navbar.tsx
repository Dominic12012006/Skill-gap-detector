import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  BarChart3, 
  AlertTriangle, 
  BookOpen, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  LogOut, 
  UserCheck 
} from 'lucide-react';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = api.getCurrentUser();

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const switchUser = async (email: string) => {
    try {
      await api.login(email, 'password123');
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/skills', label: 'Skill Profile', icon: Compass },
    { to: '/recommendations', label: 'Recommendations', icon: BookOpen },
    { to: '/assessment', label: 'Diagnostic Hub', icon: CheckCircle2 },
    { to: '/progress', label: 'Progress & Gains', icon: TrendingUp },
    { to: '/benchmark', label: 'Evaluation Benchmarks', icon: FileText },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 text-indigo-600 font-bold text-xl tracking-tight">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-slate-900">Skill<span className="text-indigo-600">Gap</span></span>
            </Link>
            <span className="hidden md:inline-block px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              Closed-Loop AI
            </span>
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            {/* Quick Demo Student Switcher */}
            <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-500 bg-slate-100 p-1 rounded-lg">
              <span className="px-1.5 font-medium text-slate-400">Demo User:</span>
              <button
                onClick={() => switchUser('alex@example.com')}
                className={`px-2 py-1 rounded transition-colors ${
                  user?.email === 'alex@example.com'
                    ? 'bg-white font-bold text-indigo-600 shadow-sm'
                    : 'hover:text-slate-800'
                }`}
              >
                Alex (Seeded)
              </button>
              <button
                onClick={() => switchUser('dominic@example.com')}
                className={`px-2 py-1 rounded transition-colors ${
                  user?.email === 'dominic@example.com'
                    ? 'bg-white font-bold text-indigo-600 shadow-sm'
                    : 'hover:text-slate-800'
                }`}
              >
                Dominic (Cold-Start)
              </button>
            </div>

            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-xs">
                {user?.name ? user.name[0] : 'S'}
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

