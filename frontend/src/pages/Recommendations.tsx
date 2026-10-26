import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Recommendation } from '../types';
import { RecommendationCard } from '../components/RecommendationCard';
import { BookOpen, RefreshCw, CheckCircle2 } from 'lucide-react';

export const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecs = async () => {
    try {
      setLoading(true);
      const list = await api.getMyRecommendations();
      setRecommendations(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleStart = async (id: number) => {
    try {
      await api.startRecommendation(id);
      fetchRecs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.completeRecommendation(id);
      fetchRecs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Personalized Learning Sequences
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Targeted Recommendations
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Multi-criteria ranked resources matched specifically to your diagnosed gaps, difficulty tolerance, and curriculum prerequisites.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
          <p>Generating adaptive learning recommendations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          No recommendations currently pending. Run a diagnostic assessment to generate targeted learning paths.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              onStart={handleStart}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

