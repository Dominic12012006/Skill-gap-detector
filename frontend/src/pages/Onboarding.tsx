import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Subject, Assessment } from '../types';
import { Compass, CheckCircle2, ArrowRight, BookOpen, Sparkles, RefreshCw } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [diagnostic, setDiagnostic] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const list = await api.getSubjects();
        setSubjects(list);
        if (list.length > 0) setSelectedSubjectId(list[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleStartDiagnostic = async () => {
    if (!selectedSubjectId) return;
    setLoading(true);
    try {
      const assessments = await api.getAssessments(selectedSubjectId, 'DIAGNOSTIC');
      if (assessments.length > 0) {
        const full = await api.getAssessment(assessments[0].id);
        setDiagnostic(full);
        setStep(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (itemId: number, opt: string) => {
    setAnswers(prev => ({ ...prev, [itemId]: opt }));
  };

  const handleSubmitDiagnostic = async () => {
    if (!diagnostic || !diagnostic.items) return;
    setSubmitting(true);
    try {
      const payload = diagnostic.items.map(it => ({
        assessment_item_id: it.id,
        selected_answer: answers[it.id] || '',
      }));
      await api.submitAssessment(diagnostic.id, payload);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Onboarding Header */}
        <div className="text-center mb-8">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
            Cold-Start Diagnostic Onboarding
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">
            Build Your Initial Competency Profile
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Establishing your baseline avoids empty dashboards and pinpoints early gaps immediately.
          </p>

          {/* Stepper indicator */}
          <div className="flex justify-center items-center space-x-3 mt-6">
            <div className={`flex items-center space-x-1.5 text-xs font-bold ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>1</span>
              <span>Select Domain</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200" />
            <div className={`flex items-center space-x-1.5 text-xs font-bold ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>2</span>
              <span>Take Diagnostic</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200" />
            <div className={`flex items-center space-x-1.5 text-xs font-bold ${step === 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>3</span>
              <span>Profile Ready</span>
            </div>
          </div>
        </div>

        {/* STEP 1: Select Subjects */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Choose Your Primary Domain</h2>
            <p className="text-sm text-slate-500 mb-6">
              Our multi-domain architecture models individual skills, not aggregate subject marks.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {subjects.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    selectedSubjectId === s.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <BookOpen className={`w-6 h-6 mb-3 ${selectedSubjectId === s.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <h3 className="font-bold text-slate-900 text-base">{s.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleStartDiagnostic}
                disabled={!selectedSubjectId || loading}
                className="inline-flex items-center px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
              >
                Continue to Diagnostic
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Diagnostic Assessment */}
        {step === 2 && diagnostic && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Diagnostic Assessment
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{diagnostic.title}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Answer these questions to baseline your skill competencies.
              </p>
            </div>

            <div className="space-y-6">
              {diagnostic.items?.map((item, idx) => (
                <div key={item.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase">Question {idx + 1}</span>
                    <span className="text-xs font-medium text-slate-400">Skill: {item.skill_name}</span>
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
                type="button"
                onClick={handleSubmitDiagnostic}
                disabled={submitting || Object.keys(answers).length < (diagnostic.items?.length || 1)}
                className="inline-flex items-center px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Synthesizing Profile...
                  </>
                ) : (
                  <>
                    Generate Competency Profile
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Profile Ready Confirmation */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Cold-Start Resolved
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Your Initial Learning Profile is Ready!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
                We've converted your diagnostic responses into per-skill mastery estimates, ranked your top skill gaps, and generated targeted recommendations.
              </p>
            </div>

            <div>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

