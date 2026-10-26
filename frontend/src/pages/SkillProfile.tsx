import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Subject, SkillMastery } from '../types';
import { SkillCard } from '../components/SkillCard';
import { Compass, Filter, RefreshCw, Layers } from 'lucide-react';

export const SkillProfile: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [skills, setSkills] = useState<SkillMastery[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | 'ALL'>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subList, skillList] = await Promise.all([
          api.getSubjects(),
          api.getStudentSkills()
        ]);
        setSubjects(subList);
        setSkills(skillList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSkills = skills.filter((s) => {
    if (selectedSubjectId !== 'ALL' && s.subject_id !== selectedSubjectId) return false;
    if (selectedLevel !== 'ALL' && s.mastery_level !== selectedLevel) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Individual Skill Profiling
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Per-Skill Competency Matrix
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          We model skills, not subjects. Each estimate is calculated using multi-source Bayesian-weighted evidence with recency decay and uncertainty calibration.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Subject Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Domain:</span>
          <button
            onClick={() => setSelectedSubjectId('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedSubjectId === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Domains
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedSubjectId === sub.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Mastery Level Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {['ALL', 'Weak', 'Developing', 'Proficient', 'Strong'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedLevel === lvl
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
          <p>Loading competency profile...</p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          No skills match your active filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.skill_id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
};

