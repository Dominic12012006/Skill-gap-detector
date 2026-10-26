import type {
  User,
  Subject,
  SkillMastery,
  Gap,
  Recommendation,
  Assessment,
  AssessmentResult,
  ReassessmentRecord,
  DashboardSummary,
  BenchmarkMetric
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  getCurrentUser(): User | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load dashboard');
    return res.json();
  },

  // Subjects & Skills
  async getSubjects(): Promise<Subject[]> {
    const res = await fetch(`${API_BASE}/subjects`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load subjects');
    return res.json();
  },

  async getStudentSkills(subjectId?: number): Promise<SkillMastery[]> {
    const url = subjectId ? `${API_BASE}/students/me/skills?subject_id=${subjectId}` : `${API_BASE}/students/me/skills`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load skill mastery profile');
    return res.json();
  },

  // Gaps & Diagnosis
  async getMyGaps(): Promise<{ student_id: number; total_gaps: number; gaps: Gap[] }> {
    const res = await fetch(`${API_BASE}/students/me/gaps`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load skill gaps');
    return res.json();
  },

  async getGapDetail(gapId: number): Promise<Gap> {
    const res = await fetch(`${API_BASE}/students/me/gaps/${gapId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load skill gap details');
    return res.json();
  },

  async triggerDiagnosis(): Promise<{ student_id: number; total_gaps: number; gaps: Gap[] }> {
    const res = await fetch(`${API_BASE}/students/me/diagnose`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to execute diagnosis');
    return res.json();
  },

  // Recommendations
  async getMyRecommendations(): Promise<Recommendation[]> {
    const res = await fetch(`${API_BASE}/students/me/recommendations`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load recommendations');
    return res.json();
  },

  async startRecommendation(recId: number): Promise<Recommendation> {
    const res = await fetch(`${API_BASE}/recommendations/${recId}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to start recommendation');
    return res.json();
  },

  async completeRecommendation(recId: number): Promise<Recommendation> {
    const res = await fetch(`${API_BASE}/recommendations/${recId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to complete recommendation');
    return res.json();
  },

  // Assessments
  async getAssessments(subjectId?: number, type?: string): Promise<Assessment[]> {
    const params = new URLSearchParams();
    if (subjectId) params.append('subject_id', subjectId.toString());
    if (type) params.append('type', type);
    const res = await fetch(`${API_BASE}/assessments?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load assessments');
    return res.json();
  },

  async getAssessment(id: number): Promise<Assessment> {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load assessment items');
    return res.json();
  },

  async submitAssessment(
    id: number,
    answers: { assessment_item_id: number; selected_answer: string; response_time_seconds?: number }[]
  ): Promise<AssessmentResult> {
    const res = await fetch(`${API_BASE}/assessments/${id}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return res.json();
  },

  // Closed Loop Reassessment
  async reassessGap(
    gapId: number,
    answers: { assessment_item_id: number; selected_answer: string; response_time_seconds?: number }[]
  ): Promise<{
    reassessment_id: number;
    gap_id: number;
    skill_id: number;
    skill_name: string;
    pre_mastery: number;
    post_mastery: number;
    improvement: number;
    status: string;
    correct_count: number;
    total_items: number;
    score_percentage: number;
  }> {
    const res = await fetch(`${API_BASE}/gaps/${gapId}/reassess`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error('Failed to process reassessment');
    return res.json();
  },

  async getReassessments(): Promise<ReassessmentRecord[]> {
    const res = await fetch(`${API_BASE}/students/me/reassessments`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load reassessment history');
    return res.json();
  },

  // Benchmarks & Evaluation
  async getBenchmarkMetrics(): Promise<{ metrics_table: BenchmarkMetric[] }> {
    const res = await fetch(`${API_BASE}/evaluation/benchmark`);
    if (!res.ok) throw new Error('Failed to load benchmark results');
    return res.json();
  }
};

