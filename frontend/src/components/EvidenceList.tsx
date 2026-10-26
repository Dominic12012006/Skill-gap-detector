import React from 'react';
import { ContributingEvidence } from '../types';
import { 
  HelpCircle, 
  FileCheck, 
  Award, 
  ClipboardList, 
  UserCheck, 
  RefreshCw,
  Calendar,
  Layers
} from 'lucide-react';

interface EvidenceListProps {
  evidence: ContributingEvidence[];
}

export const EvidenceList: React.FC<EvidenceListProps> = ({ evidence }) => {
  const getSourceIcon = (source: string) => {
    switch (source.toUpperCase()) {
      case 'QUIZ':
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      case 'ASSIGNMENT':
        return <FileCheck className="w-4 h-4 text-blue-600" />;
      case 'GRADEBOOK':
        return <Award className="w-4 h-4 text-purple-600" />;
      case 'DIAGNOSTIC':
        return <ClipboardList className="w-4 h-4 text-indigo-600" />;
      case 'SELF_REPORT':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'REASSESSMENT':
        return <RefreshCw className="w-4 h-4 text-teal-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  const getSourceBadgeClass = (source: string) => {
    switch (source.toUpperCase()) {
      case 'QUIZ':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ASSIGNMENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'GRADEBOOK':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DIAGNOSTIC':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SELF_REPORT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REASSESSMENT':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (!evidence || evidence.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        No direct evidence items logged yet for this skill.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {evidence.map((ev, idx) => {
        const scorePct = Math.round(ev.score * 100);
        return (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors gap-2"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                {getSourceIcon(ev.source)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${getSourceBadgeClass(ev.source)}`}>
                    {ev.source}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {ev.description || `${ev.source} performance`}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {ev.date}
                  </span>
                  <span>•</span>
                  <span>Source Reliability Weight: <strong>{ev.weight}</strong></span>
                </div>
              </div>
            </div>

            <div className="text-right sm:pl-4">
              <span className={`text-base font-bold ${scorePct >= 60 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {scorePct}%
              </span>
              <span className="text-xs text-slate-400 block">Raw: {ev.raw_score}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

