import React from 'react';
import { SkillMastery } from '../types';
import { ShieldCheck, AlertCircle, TrendingUp, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SkillCardProps {
  skill: SkillMastery;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  const getBadgeColor = () => {
    switch (skill.mastery_level) {
      case 'Strong':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Proficient':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Developing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Weak':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getProgressBarColor = () => {
    if (skill.mastery_score >= 0.80) return 'bg-emerald-500';
    if (skill.mastery_score >= 0.60) return 'bg-blue-500';
    if (skill.mastery_score >= 0.40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const pct = Math.round(skill.mastery_score * 100);
  const confPct = Math.round(skill.confidence_score * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {skill.subject_name}
          </span>
          <h3 className="font-semibold text-slate-900 text-base mt-0.5">{skill.skill_name}</h3>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getBadgeColor()}`}>
          {skill.mastery_level}
        </span>
      </div>

      <div className="space-y-2 mt-4">
        <div className="flex justify-between text-xs font-medium text-slate-600">
          <span>Mastery</span>
          <span className="font-bold text-slate-900">{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1" title="Confidence based on evidence quantity and source agreement">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Confidence: <strong className="text-slate-700">{confPct}%</strong></span>
        </div>
        <div>
          <span>{skill.evidence_count} evidence source(s)</span>
        </div>
      </div>

      {skill.has_gap && (
        <div className="mt-3">
          <Link
            to={`/skills/gaps/${skill.skill_id}`}
            className="w-full inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
          >
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
            Diagnosed Gap • View Evidence
          </Link>
        </div>
      )}
    </div>
  );
};

