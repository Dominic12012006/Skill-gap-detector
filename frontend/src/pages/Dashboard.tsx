import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardSummary, Gap } from '../types';
import { GapCard } from '../components/GapCard';
import { ReassessmentModal } from '../components/ReassessmentModal';
import { 
  Sparkles, 
  Compass, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reassessment modal state for quick closed-loop test
  const [modalOpen, setModalOpen] = useState(false);
  const [activeGapForReassess, setActiveGapForReassess] = useState<Gap | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, gapsRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getMyGaps()
      ]);
      setSummary(sumRes);
      setGaps(gapsRes.gaps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunDiagnosis = async () => {
    setRefreshing(true);
    try {
      const res = await api.triggerDiagnosis();
      setGaps(res.gaps);
      const sum = await api.getDashboardSummary();
      setSummary(sum);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleReassessmentSuccess = (result: any) => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
          <p className="font-medium">Synthesizing multi-source skill competencies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Explainable Skill Gap Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Good morning, {summary?.student_name.split(' ')[0] || 'Learner'}
          </h1>
          <p className="text-indigo-200 text-sm mt-1 max-w-xl">
            Here's where you can improve next. We trace your learning evidence across quizzes, assignments, and diagnostics into actionable recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunDiagnosis}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xs text-xs font-bold border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Run Diagnosis
          </button>
          <Link
            to="/assessment"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Take Diagnostic
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Skills Assessed</span>
            <Compass className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{summary?.skills_assessed}</p>
          <span className="text-xs text-slate-400 mt-1 block">Cross-domain profile</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Strong Skills</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{summary?.strong_count}</p>
          <span className="text-xs text-slate-400 mt-1 block">Mastery ≥ 80%</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Developing</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{summary?.developing_count}</p>
          <span className="text-xs text-slate-400 mt-1 block">Mastery 40% - 59%</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Priority Gaps</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{summary?.high_priority_gaps_count}</p>
          <span className="text-xs text-slate-400 mt-1 block">Actionable focus areas</span>
        </div>
      </div>

      {/* TOP PRIORITY GAPS (Spec Section 23.3 & Section 40) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">High-Priority Skill Gaps</h2>
            <p className="text-xs text-slate-500">
              Ranked by severity, evidence confidence, and prerequisite importance.
            </p>
          </div>
          <Link
            to="/skills"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            View All Skills <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {gaps.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 text-base">No Critical Gaps Detected!</h3>
            <p className="text-xs text-slate-500 mt-1">
              All assessed skills currently meet or exceed the proficiency threshold.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gaps.slice(0, 3).map((g) => (
              <GapCard key={g.id} gap={g} />
            ))}
          </div>
        )}
      </section>

      {/* Domain Mastery Breakdown & Recent Gains Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Domain Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Cross-Domain Competency</h2>
          <p className="text-xs text-slate-500 mb-5">
            Aggregated mastery across the multi-subject knowledge hierarchy.
          </p>

          <div className="space-y-5">
            {summary?.subjects.map((sub) => (
              <div key={sub.subject_id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{sub.subject_name}</span>
                  <span className="text-slate-600">{sub.average_percentage}% ({sub.assessed_skills} skills)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${sub.average_percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closed-Loop Learning Gains / Recent Reassessments */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-600" />
              Verified Learning Gains
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Before vs. After reassessment progress.
            </p>

            {summary?.recent_improvements && summary.recent_improvements.length > 0 ? (
              <div className="space-y-3">
                {summary.recent_improvements.map((item) => (
                  <div key={item.id} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{item.skill_name}</span>
                      <span className="font-extrabold text-emerald-600">{item.improvement}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-2xs text-slate-500 mt-1">
                      <span>{item.pre_mastery}% pre</span>
                      <span>→</span>
                      <span className="font-bold text-slate-700">{item.post_mastery}% post</span>
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Complete targeted resources and take a reassessment to record verified gains.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/progress"
              className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              View Full Progress Timeline <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Reassessment Modal */}
      {modalOpen && activeGapForReassess && (
        <ReassessmentModal
          gapId={activeGapForReassess.id}
          skillName={activeGapForReassess.skill_name}
          preMastery={activeGapForReassess.mastery_score}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleReassessmentSuccess}
        />
      )}
    </div>
  );
};

