import React from 'react';
import { Recommendation } from '../types';
import { Video, BookOpen, FileCode, CheckCircle, Clock, ExternalLink, Play } from 'lucide-react';

interface RecommendationCardProps {
  rec: Recommendation;
  onStart: (id: number) => void;
  onComplete: (id: number) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  rec,
  onStart,
  onComplete
}) => {
  const getResourceIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'VIDEO':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'TUTORIAL':
        return <FileCode className="w-4 h-4 text-indigo-500" />;
      case 'PRACTICE':
      case 'QUIZ':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (rec.status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case 'STARTED':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Recommended</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              {getResourceIcon(rec.resource.resource_type)}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {rec.resource.resource_type} • Step {rec.resource.sequence_order}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        <h3 className="text-base font-bold text-slate-900 mt-2">
          {rec.resource.title}
        </h3>
        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
          {rec.resource.description}
        </p>

        {rec.reason && (
          <p className="text-xs text-indigo-700 bg-indigo-50/60 border border-indigo-100 p-2 rounded-md mt-3">
            <strong>Targeted for you:</strong> {rec.reason}
          </p>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-slate-500">
          <span className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {rec.resource.estimated_minutes} min
          </span>
          <span>•</span>
          <span>Diff: {Math.round(rec.resource.difficulty * 10)}/10</span>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={rec.resource.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (rec.status === 'RECOMMENDED') onStart(rec.id);
            }}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Open <ExternalLink className="w-3 h-3 ml-1" />
          </a>

          {rec.status !== 'COMPLETED' ? (
            <button
              onClick={() => onComplete(rec.id)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            >
              Mark Done
            </button>
          ) : (
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mastered
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

