import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Assessment as AssessmentType, AssessmentResult } from '../types';
import { CheckCircle2, RefreshCw, Sparkles, ArrowRight, BookOpen, Check, X } from 'lucide-react';

export const Assessment: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentType[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<AssessmentType | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const list = await api.getAssessments();
        setAssessments(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  const handleSelectAssessment = async (id: number) => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const full = await api.getAssessment(id);
      setActiveAssessment(full);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (itemId: number, opt: string) => {
    setAnswers(prev => ({ ...prev, [itemId]: opt }));
  };

  const handleSubmit = async () => {
    if (!activeAssessment || !activeAssessment.items) return;
    setSubmitting(true);
    try {
      const payload = activeAssessment.items.map(it => ({
        assessment_item_id: it.id,
        selected_answer: answers[it.id] || '',
      }));
      const res = await api.submitAssessment(activeAssessment.id, payload);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Evidence Generation Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Assessment & Diagnostic Hub
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Every question response produces normalized multi-source evidence, updating your per-skill competency profile immediately.
        </p>
      </div>

      {/* Select Assessment list if none active */}
      {!activeAssessment && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((asm) => (
            <div
              key={asm.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {asm.type}
                  </span>
                  <span className="text-xs text-slate-400">{asm.items_count} Questions</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{asm.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{asm.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleSelectAssessment(asm.id)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                >
                  Start Assessment <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Assessment Runner */}
      {activeAssessment && !result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {activeAssessment.type}
              </span>
              <h2 className="text-xl font-bold text-slate-900">{activeAssessment.title}</h2>
            </div>
            <button
              onClick={() => setActiveAssessment(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel & Exit
            </button>
          </div>

          <div className="space-y-6">
            {activeAssessment.items?.map((item, idx) => (
              <div key={item.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase">Question {idx + 1}</span>
                  <span className="text-xs font-medium text-slate-500">Skill: {item.skill_name}</span>
                </div>
                <p className="font-semibold text-slate-800 text-sm mb-4">{item.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {item.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleAnswerSelect(item.id, opt)}
                      className={`text-left px-4 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                        answers[item.id] === opt
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length < (activeAssessment.items?.length || 1)}
              className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Grading & Updating Masteries...
                </>
              ) : (
                <>
                  Submit Assessment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Graded Result View */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Assessment Complete!</h2>
            <p className="text-sm text-slate-600 mt-1">
              You scored <strong>{result.percentage}%</strong> ({result.correct_count} of {result.total_questions} correct).
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Updated Skills:</span>
              {result.skills_updated.map((sk, i) => (
                <span key={i} className="px-2 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-md">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Question Explanations */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Review & Explanations</h3>
            {result.items.map((it, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-800">Q{idx + 1}: {it.question}</span>
                  {it.is_correct ? (
                    <span className="text-emerald-600 font-bold flex items-center">
                      <Check className="w-3.5 h-3.5 mr-0.5" /> Correct
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold flex items-center">
                      <X className="w-3.5 h-3.5 mr-0.5" /> Incorrect
                    </span>
                  )}
                </div>
                <div className="text-slate-600">
                  <span>Your answer: <strong>{it.selected_answer}</strong></span>
                  {!it.is_correct && (
                    <span className="ml-3 text-emerald-700">Correct: <strong>{it.correct_answer}</strong></span>
                  )}
                </div>
                {it.explanation && (
                  <p className="text-slate-500 italic pt-1 border-t border-slate-200/60">
                    {it.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setActiveAssessment(null);
                setResult(null);
              }}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

