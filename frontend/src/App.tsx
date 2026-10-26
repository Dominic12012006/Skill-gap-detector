import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { SkillProfile } from './pages/SkillProfile';
import { SkillGapDetails } from './pages/SkillGapDetails';
import { Recommendations } from './pages/Recommendations';
import { Assessment } from './pages/Assessment';
import { Progress } from './pages/Progress';
import { Benchmark } from './pages/Benchmark';
import { api } from './services/api';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/onboarding';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {!isAuthPage && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAuthPage && (
        <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
          Learning Platform Skill Gap Identifier • Closed-Loop Explainable Architecture
        </footer>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  // Auto-init demo user in dev mode if none exists
  useEffect(() => {
    if (!localStorage.getItem('user')) {
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Alex Rivera',
        email: 'alex@example.com',
        role: 'student'
      }));
    }
  }, []);

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/skills" element={<SkillProfile />} />
          <Route path="/skills/gaps/:gapId" element={<SkillGapDetails />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/benchmark" element={<Benchmark />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;

