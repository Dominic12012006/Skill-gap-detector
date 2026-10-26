export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Subject {
  id: number;
  name: string;
  description: string;
}

export interface Skill {
  id: number;
  subject_id: number;
  parent_skill_id?: number | null;
  name: string;
  code: string;
  description?: string;
  difficulty: number;
  prerequisite_ids: number[];
}

export interface SkillMastery {
  skill_id: number;
  skill_name: string;
  skill_code: string;
  subject_id: number;
  subject_name: string;
  difficulty: number;
  mastery_score: number;
  confidence_score: number;
  evidence_count: number;
  mastery_level: 'Weak' | 'Developing' | 'Proficient' | 'Strong' | 'Unassessed';
  has_gap: boolean;
  last_updated?: string | null;
}

export interface ContributingEvidence {
  source: string;
  raw_score: number;
  score: number;
  date: string;
  weight: number;
  description?: string;
}

export interface Gap {
  id: number;
  student_id: number;
  skill_id: number;
  skill_name: string;
  skill_code: string;
  subject_id: number;
  subject_name: string;
  mastery_score: number;
  severity_score: number;
  confidence_score: number;
  priority_score: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'IMPROVED' | 'RESOLVED' | 'PERSISTENT';
  explanation?: string;
  reason_codes: string[];
  evidence_count: number;
  evidence: ContributingEvidence[];
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: number;
  skill_id: number;
  skill_name?: string;
  title: string;
  description?: string;
  resource_type: 'VIDEO' | 'ARTICLE' | 'TUTORIAL' | 'PRACTICE' | 'QUIZ' | 'DOCUMENTATION';
  url: string;
  difficulty: number;
  estimated_minutes: number;
  sequence_order: number;
}

export interface Recommendation {
  id: number;
  student_id: number;
  gap_id: number;
  resource_id: number;
  resource: Resource;
  skill_id: number;
  skill_name: string;
  gap_priority: number;
  ranking_score: number;
  reason?: string;
  status: 'RECOMMENDED' | 'STARTED' | 'COMPLETED';
  recommended_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface AssessmentItem {
  id: number;
  skill_id: number;
  skill_name?: string;
  question: string;
  difficulty: number;
  options: string[];
}

export interface Assessment {
  id: number;
  subject_id: number;
  subject_name?: string;
  title: string;
  type: 'DIAGNOSTIC' | 'QUIZ' | 'REASSESSMENT';
  target_skill_id?: number | null;
  description?: string;
  items_count: number;
  items?: AssessmentItem[];
}

export interface AssessmentResultItem {
  assessment_item_id: number;
  question: string;
  skill_id: number;
  skill_name: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  score: number;
  explanation?: string;
}

export interface AssessmentResult {
  assessment_id: number;
  title: string;
  total_questions: number;
  correct_count: number;
  percentage: number;
  items: AssessmentResultItem[];
  skills_updated: string[];
}

export interface ReassessmentRecord {
  id: number;
  student_id: number;
  gap_id?: number | null;
  skill_id: number;
  skill_name: string;
  pre_mastery: number;
  post_mastery: number;
  improvement: number;
  status: 'RESOLVED' | 'IMPROVED' | 'PERSISTENT';
  completed_at: string;
}

export interface DashboardSummary {
  student_name: string;
  skills_assessed: number;
  strong_count: number;
  proficient_count: number;
  developing_count: number;
  weak_count: number;
  high_priority_gaps_count: number;
  top_gaps: {
    gap_id: number;
    skill_id: number;
    skill_name: string;
    subject_name: string;
    mastery_score: number;
    mastery_percentage: number;
    confidence_score: number;
    confidence_percentage: number;
    severity_score: number;
    priority_score: number;
    status: string;
    why_this_appears: string;
  }[];
  subjects: {
    subject_id: number;
    subject_name: string;
    total_skills: number;
    assessed_skills: number;
    average_mastery: number;
    average_percentage: number;
  }[];
  recent_improvements: {
    id: number;
    skill_name: string;
    pre_mastery: number;
    post_mastery: number;
    improvement: string;
    status: string;
    completed_at: string;
  }[];
}

export interface BenchmarkMetric {
  metric: string;
  baseline_1_subject_score: number;
  baseline_2_unweighted_avg: number;
  proposed_engine: number;
  improvement: string;
}

