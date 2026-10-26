import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BenchmarkMetric } from '../types';
import { FileText, CheckCircle2, TrendingUp, Cpu, RefreshCw, Award, ArrowUpRight } from 'lucide-react';

export const Benchmark: React.FC = () => {
  const [metrics, setMetrics] = useState<BenchmarkMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        setLoading(true);
        const data = await api.getBenchmarkMetrics();
        setMetrics(data.metrics_table);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenchmark();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Research Evaluation Benchmarks
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Comparative Empirical Performance
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Quantitative comparison between Baseline 1 (Subject Aggregate), Baseline 2 (Unweighted Average), and the Proposed Closed-Loop Architecture.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Baseline 1</span>
          <h3 className="font-bold text-slate-800 text-sm mt-1">Subject Aggregate</h3>
          <p className="text-xs text-slate-500 mt-2">
            Collapses all coursework into a single subject score. Fails to pinpoint granular skill weaknesses.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Baseline 2</span>
          <h3 className="font-bold text-slate-800 text-sm mt-1">Unweighted Per-Skill</h3>
          <p className="text-xs text-slate-500 mt-2">
            Per-skill average without recency decay or source reliability weighting. Highly sensitive to noise.
          </p>
        </div>

        <div className="bg-indigo-50/60 rounded-xl border border-indigo-200 p-5 shadow-2xs">
          <span className="text-xs font-bold text-indigo-600 uppercase">Proposed Architecture</span>
          <h3 className="font-bold text-indigo-950 text-sm mt-1">Closed-Loop Engine</h3>
          <p className="text-xs text-indigo-800/80 mt-2">
            Multi-source fusion, exponential recency decay, uncertainty calibration, and prerequisite-aware ranking.
          </p>
        </div>
      </div>

      {/* Metrics Table matching Spec Section 37 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            Evaluation Results Matrix (Held-out Empirical Evaluation)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Measured across 200 synthesized multi-evidence student interaction sequences.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
            <p>Computing benchmark metrics...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Metric</th>
                  <th scope="col" className="px-6 py-3.5">Baseline 1 (Subject Score)</th>
                  <th scope="col" className="px-6 py-3.5">Baseline 2 (Unweighted Avg)</th>
                  <th scope="col" className="px-6 py-3.5 text-indigo-700 bg-indigo-50/50">Proposed Engine</th>
                  <th scope="col" className="px-6 py-3.5 text-emerald-700 bg-emerald-50/50">Improvement</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 font-medium">
                {metrics.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-semibold">{row.metric}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{row.baseline_1_subject_score}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{row.baseline_2_unweighted_avg}</td>
                    <td className="px-6 py-4 text-indigo-700 font-mono font-bold text-xs bg-indigo-50/30">
                      {row.proposed_engine}
                    </td>
                    <td className="px-6 py-4 text-emerald-700 font-bold text-xs bg-emerald-50/30">
                      {row.improvement}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Conceptual Research Alignment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center">
          <Award className="w-4 h-4 mr-1.5 text-indigo-600" />
          Key Research Contributions over Prior Work (ALIGNAgent)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <strong className="text-slate-800 block mb-1">1. Diagnostic & Self-Report Ingestion</strong>
            Supports heterogeneous evidence sources with calibrated reliability weighting rather than quiz data alone.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <strong className="text-slate-800 block mb-1">2. Two-Axis Gap Ranking (Severity & Confidence)</strong>
            Separates the magnitude of skill deficit from system epistemic certainty to avoid misleading diagnosis.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <strong className="text-slate-800 block mb-1">3. Cross-Domain Skill Hierarchy</strong>
            Domain-independent skill DAG supporting Computer Science, Mathematics, English, and arbitrary subjects.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <strong className="text-slate-800 block mb-1">4. Closed-Loop Reassessment Stage</strong>
            Verifies whether recommendations produced genuine mastery gains and transitions gap state dynamically.
          </div>
        </div>
      </div>
    </div>
  );
};

