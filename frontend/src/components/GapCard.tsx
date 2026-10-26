import React from 'react';
import { Gap } from '../types';
import { AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, FileText, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GapCardProps {
  gap: Gap;
}

export const GapCard: React.FC<GapCardProps> = ({ gap }) => {
  const masteryPct = Math.round(gap.mastery_score * 100);
  const confidencePct = Math.round(gap.confidence_score * 100);

  const getPriorityBadge = () => {
    if (gap.priority_score >= 0.45) {
      return { text: 'High Priority', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    }
    if (gap.priority_score >= 0.30) {
      return { text: 'Medium Priority', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    return { text: 'Low Priority', color: 'bg-slate-100 text-slate-800 border-slate-200' };
  };

  const badge = getPriorityBadge();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Top Banner */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {gap.subject_name}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{gap.skill_name}</h3>
          </div>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.color}`}>
            {badge.text}
          </span>
        </div>

        {/* Mastery and Confidence Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-2.5">
            <span className="text-xs text-rose-600 font-medium block">Estimated Mastery</span>
            <span className="text-xl font-black text-rose-700">{masteryPct}%</span>
          </div>
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-2.5">
            <div className="flex items-center space-x-1 text-xs text-indigo-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Confidence</span>
            </div>
            <span className="text-xl font-black text-indigo-700">{confidencePct}%</span>
          </div>
        </div>
      </div>

      {/* WHY THIS IS A GAP */}
      <div className="p-5 space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500" />
            Why This Is A Gap
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {gap.explanation || 'Diagnostic analysis indicated below-expected mastery in this skill area.'}
          </p>
        </div>

        {/* Contributing Evidence Preview */}
        {gap.evidence && gap.evidence.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-indigo-500" />
              Underlying Evidence ({gap.evidence.length} sources)
            </h4>
            <div className="space-y-1.5">
              {gap.evidence.slice(0, 2).map((ev, i) => (
                <div key={i} className="flex justify-between items-center text-xs bg-slate-50/60 px-2.5 py-1.5 rounded border border-slate-100">
                  <span className="font-semibold text-slate-700">{ev.source}: {Math.round(ev.score * 100)}%</span>
                  <span className="text-slate-400">{ev.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center space-x-2">
          <Link
            to={`/skills/gaps/${gap.id}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Zap className="w-4 h-4 mr-1.5" />
            Start Targeted Pathway
          </Link>
          <Link
            to={`/skills/gaps/${gap.id}`}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Audit Evidence
          </Link>
        </div>
      </div>
    </div>
  );
};

