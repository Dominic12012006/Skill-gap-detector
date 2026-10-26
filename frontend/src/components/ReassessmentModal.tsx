import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Assessment, AssessmentItem } from '../types';
import { CheckCircle2, XCircle, ArrowRight, Sparkles, RefreshCw, X } from 'lucide-react';

interface ReassessmentModalProps {
  gapId: number;
  skillName: string;
  preMastery: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export const ReassessmentModal: React.FC<ReassessmentModalProps> = ({
  gapId,
  skillName,
  preMastery,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchReassessment = async () => {
      try {
        setLoading(true);
        const list = await api.getAssessments(undefined, 'REASSESSMENT');
        if (list.length > 0) {
          const detail = await api.getAssessment(list[0].id);
          setAssessment(detail);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReassessment();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (itemId: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [itemId]: option }));
  };

  const handleSubmit = async () => {
    if (!assessment || !assessment.items) return;
    setSubmitting(true);
    try {
      const answers = assessment.items.map(it => ({
        assessment_item_id: it.id,
        selected_answer: selectedAnswers[it.id] || '',
      }));

      const res = await api.reassessGap(gapId, answers);
      setResult(res);
      onSuccess(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Closed-Loop Verification
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {skillName} Reassessment
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
            <p>Loading targeted reassessment items...</p>
          </div>
        )}

        {/* Test Items */}
        {!loading && !result && assessment && (
          <div className="py-4 space-y-6">
            <p className="text-sm text-slate-600">
              Answer the questions below to evaluate your knowledge acquisition and update your competency profile.
            </p>

            {assessment.items?.map((item, idx) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide block mb-1">
                  Question {idx + 1}
                </span>
                <p className="font-semibold text-slate-800 text-sm mb-3">{item.question}</p>
                <div className="space-y-2">
                  {item.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelect(item.id, opt)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all border ${
                        selectedAnswers[item.id] === opt
                          ? 'bg-indigo-600 text-white font-medium border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || Object.keys(selectedAnswers).length < (assessment.items?.length || 1)}
                className="inline-flex items-center px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm transition-all"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Grading & Recalculating...
                  </>
                ) : (
                  <>
                    Submit Reassessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Screen (Spec Section 21 & 32 Demonstration!) */}
        {result && (
          <div className="py-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Closed-Loop Verified
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Competency Profile Updated!
              </h3>
              <p className="text-slate-600 text-sm mt-1">
                Reassessment score: <strong>{result.score_percentage}%</strong> ({result.correct_count} of {result.total_items} correct)
              </p>
            </div>

            {/* Before vs After Callout */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md mx-auto grid grid-cols-3 gap-2 items-center">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Pre-Mastery</span>
                <span className="text-xl font-bold text-rose-600">
                  {Math.round(result.pre_mastery * 100)}%
                </span>
              </div>
              <div className="flex flex-col items-center">
                <ArrowRight className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-bold text-emerald-600 mt-0.5">
                  +{Math.round(result.improvement * 100)}% Gain
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Post-Mastery</span>
                <span className="text-xl font-bold text-emerald-600">
                  {Math.round(result.post_mastery * 100)}%
                </span>
              </div>
            </div>

            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Gap Status: {result.status}
            </div>

            <div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

