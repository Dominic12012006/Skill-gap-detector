import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Gap, Recommendation } from '../types';
import { EvidenceList } from '../components/EvidenceList';
import { RecommendationCard } from '../components/RecommendationCard';
import { ReassessmentModal } from '../components/ReassessmentModal';
import { 
  AlertTriangle, 
  ShieldCheck, 
  ArrowLeft, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';

export const SkillGapDetails: React.FC = () => {
  const { gapId } = useParams<{ gapId: string }>();
  const [gap, setGap] = useState<Gap | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [reassessModalOpen, setReassessModalOpen] = useState(false);

  const fetchGapDetails = async () => {
    if (!gapId) return;
    try {
      setLoading(true);
      const [g, recList] = await Promise.all([
        api.getGapDetail(parseInt(gapId)),
        api.getMyRecommendations()
      ]);
      setGap(g);
      // Filter recommendations matching this gap
      setRecommendations(recList.filter((r) => r.gap_id === parseInt(gapId)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGapDetails();
  }, [gapId]);

  const handleStartRec = async (id: number) => {
    try {
      await api.startRecommendation(id);
      fetchGapDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteRec = async (id: number) => {
    try {
      await api.completeRecommendation(id);
      fetchGapDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
          <p>Auditing diagnostic evidence & generating explanation...</p>
        </div>
      </div>
    );
  }

  if (!gap) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-500">Skill gap record not found.</p>
        <Link to="/" className="text-indigo-600 font-bold mt-2 inline-block">Return to Dashboard</Link>
      </div>
    );
  }

  const masteryPct = Math.round(gap.mastery_score * 100);
  const confidencePct = Math.round(gap.confidence_score * 100);
  const severityPct = Math.round(gap.severity_score * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      {/* Gap Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {gap.subject_name}
              </span>
              <span>•</span>
              <span className="text-xs font-semibold text-slate-500">Code: {gap.skill_code}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {gap.skill_name}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              High Priority Gap
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              Status: {gap.status}
            </span>
          </div>
        </div>

        {/* 4 Core Quantitative Metrics (Section 25) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Estimated Mastery</span>
            <span className="text-2xl font-black text-rose-600 block mt-1">{masteryPct}%</span>
            <span className="text-2xs text-slate-400">Target threshold: 60%</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Confidence</span>
            <span className="text-2xl font-black text-indigo-600 block mt-1">{confidencePct}%</span>
            <span className="text-2xs text-slate-400">Multi-source agreement</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Severity</span>
            <span className="text-2xl font-black text-amber-600 block mt-1">{severityPct}%</span>
            <span className="text-2xs text-slate-400">1.0 - Mastery</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Priority Score</span>
            <span className="text-2xl font-black text-purple-600 block mt-1">
              {Math.round(gap.priority_score * 100)} / 100
            </span>
            <span className="text-2xs text-slate-400">Prerequisite weighted</span>
          </div>
        </div>
      </div>

      {/* WHY THIS IS A GAP & EXPLANATION (Spec Section 17 & 25) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Transparent Diagnosis
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Why the System Believes This Skill is Weak
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Our explainable AI layer synthesizes evidence without unsupported hallucinations.
          </p>
        </div>

        {/* Natural Language Explanation Box */}
        <div className="p-5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-800 font-bold text-sm">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>Learner-Facing Diagnostic Explanation</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {gap.explanation}
          </p>
        </div>

        {/* Reason Codes */}
        {gap.reason_codes && gap.reason_codes.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Diagnostic Reason Codes:
            </h3>
            <div className="flex flex-wrap gap-2">
              {gap.reason_codes.map((code, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-mono font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Supporting Evidence Breakdown */}
        <div className="pt-2">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-1.5 text-indigo-600" />
            Underlying Evidence Trail ({gap.evidence?.length || 0} Records)
          </h3>
          <EvidenceList evidence={gap.evidence || []} />
        </div>
      </div>

      {/* WHAT TO DO NEXT (Recommended Sequence) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Prescriptive Remediation
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Targeted Learning Sequence
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Work through the concept lesson and worked example, then verify your mastery.
            </p>
          </div>

          {/* Big CTA for Reassessment (Spec Section 21 & 25) */}
          <button
            onClick={() => setReassessModalOpen(true)}
            className="inline-flex items-center justify-center px-5 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            <Zap className="w-4 h-4 mr-2" />
            Take Targeted Reassessment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              onStart={handleStartRec}
              onComplete={handleCompleteRec}
            />
          ))}
        </div>
      </div>

      {/* Reassessment Modal */}
      {reassessModalOpen && (
        <ReassessmentModal
          gapId={gap.id}
          skillName={gap.skill_name}
          preMastery={gap.mastery_score}
          isOpen={reassessModalOpen}
          onClose={() => setReassessModalOpen(false)}
          onSuccess={() => fetchGapDetails()}
        />
      )}
    </div>
  );
};

