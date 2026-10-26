import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ReassessmentRecord, Gap } from '../types';
import { TrendingUp, CheckCircle2, AlertTriangle, ArrowRight, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Progress: React.FC = () => {
  const [reassessments, setReassessments] = useState<ReassessmentRecord[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reList, gapsRes] = await Promise.all([
          api.getReassessments(),
          api.getMyGaps()
        ]);
        setReassessments(reList);
        setGaps(gapsRes.gaps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalGains = reassessments.reduce((acc, curr) => acc + (curr.improvement > 0 ? curr.improvement : 0), 0);
  const avgGain = reassessments.length > 0 ? Math.round((totalGains / reassessments.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Closed-Loop Longitudinal Outcomes
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Learning Gains & Verification Timeline
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Evaluating pre-intervention vs. post-reassessment mastery to verify learning effectiveness.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Reassessments Completed</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{reassessments.length}</span>
          <span className="text-2xs text-slate-400">Targeted evaluations</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Average Mastery Gain</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">+{avgGain}%</span>
          <span className="text-2xs text-slate-400">Post-resource intervention</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Resolved Gaps</span>
          <span className="text-2xl font-black text-indigo-600 block mt-1">
            {reassessments.filter((r) => r.status === 'RESOLVED').length}
          </span>
          <span className="text-2xs text-slate-400">Crossed proficiency mark</span>
        </div>
      </div>

      {/* Before vs After Callout Highlights (Spec Section 27) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
          Pre vs. Post Mastery Trajectory
        </h2>

        {reassessments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-sm">
            No reassessments completed yet. Open an active gap from your dashboard to complete the closed-loop cycle.
          </div>
        ) : (
          <div className="space-y-4">
            {reassessments.map((r) => {
              const prePct = Math.round(r.pre_mastery * 100);
              const postPct = Math.round(r.post_mastery * 100);
              const gainPct = Math.round(r.improvement * 100);

              return (
                <div
                  key={r.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-slate-900">{r.skill_name}</span>
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                        {r.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(r.completed_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 bg-white p-3 rounded-lg border border-slate-200">
                    <div className="text-center">
                      <span className="text-2xs uppercase text-slate-400 font-bold block">Pre</span>
                      <span className="text-sm font-bold text-rose-600">{prePct}%</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                    <div className="text-center">
                      <span className="text-2xs uppercase text-slate-400 font-bold block">Post</span>
                      <span className="text-sm font-bold text-emerald-600">{postPct}%</span>
                    </div>
                    <div className="pl-3 border-l border-slate-200 text-center">
                      <span className="text-2xs uppercase text-emerald-600 font-bold block">Gain</span>
                      <span className="text-sm font-black text-emerald-600">+{gainPct} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

