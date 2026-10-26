# Learning Platform Skill Gap Identifier for Students

> **An Explainable, Closed-Loop Learning Platform for Student Skill Diagnostics, Targeted Remediation, and Reassessment**

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Project Overview

The **Learning Platform Skill Gap Identifier** is an end-to-end educational intelligence system designed to move beyond coarse subject-level grading (e.g., *"Computer Science: 67%"*). Instead, it maintains a granular, evolving **per-skill competency profile**, estimates **epistemic uncertainty/confidence**, identifies and ranks skill gaps by **severity and prerequisite importance**, provides **evidence-backed explanations in plain language**, recommends **targeted learning resources**, and conducts **targeted reassessments** to close the learning loop.

```text
Evidence Collection (Quizzes, Assignments, Diagnostics, Self-reports)
       ↓
Evidence Normalization & Recency Weighting
       ↓
Skill Mapping & Prerequisite Graph Propagation
       ↓
Per-Skill Mastery & Epistemic Confidence Estimation
       ↓
Gap Detection (Severity + Confidence Ranking)
       ↓
Explainable Diagnosis (5 Core Student Questions)
       ↓
Targeted Resource Sequencing (Concept → Worked Example → Practice)
       ↓
Learner Remediation & Engagement
       ↓
Closed-Loop Reassessment (Targeted Verification)
       ↓
Updated Skill Profile (Pre vs. Post Mastery Gains)
       ↺
```

---

## 2. Problem Statement

Most learning management systems (LMS) and assessment tools reduce student work into aggregate marks. This creates five critical shortcomings:
1. **Coarse Aggregation:** Students cannot identify which individual skills within a course require attention.
2. **Lack of Explainability:** Low scores are rarely accompanied by an explanation of *why* the system concluded a skill is weak.
3. **Fragmented Workflows:** Knowledge tracing, diagnosis, recommendation, and reassessment are studied and implemented in silos.
4. **Single-Domain Constraints:** Systems are predominantly hard-coded to a single programming or math curriculum.
5. **The Cold-Start Dilemma:** New learners with minimal interaction history face empty dashboards or unreliable diagnoses.

This system solves these issues through an end-to-end, multi-domain, explainable closed loop.

---

## 3. Architecture Diagram

```text
┌────────────────────────────────────────────────────────────────────────┐
│                               FRONTEND                                 │
│                React 18 • TypeScript • Tailwind CSS • Vite             │
│                                                                        │
│  Dashboard │ Skill Matrix │ Gap Audit │ Learning Paths │ Reassessment  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST / JSON (JWT Auth)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                                BACKEND                                 │
│                         FastAPI • Python 3.12                          │
│                                                                        │
│ Auth │ Evidence Ingestion │ Skill Graph │ Diagnosis │ Recommendations  │
│ Assessments │ Reassessment Engine │ Empirical Benchmark Analytics       │
└───────────────────┬───────────────────┬───────────────────┬────────────┘
                    │                   │                   │
                    ▼                   ▼                   ▼
           ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
           │   PostgreSQL    │ │  Knowledge      │ │ Resource        │
           │   / SQLite      │ │  Tracing Engine │ │ Catalog         │
           └─────────────────┘ └─────────────────┘ └─────────────────┘
                                        │
                                        ▼
                             Explainability Synthesizer
```

---

## 4. Key Features

- **Multi-Source Evidence Ingestion:** Combines evidence from Quizzes (0.85), Assignments (0.90), Gradebooks (0.75), Diagnostics (1.00), Self-Reports (0.40), and Reassessments (1.00).
- **Temporal Recency Decay:** Exponential weighting $w(t) = \exp(-\lambda \Delta t)$ ensures recent performance has higher predictive validity.
- **Epistemic Confidence Modeling:** Distinguishes between definite weaknesses and early signals with sparse evidence ($C_k < 0.40$).
- **Prerequisite-Aware Prioritization:** Boosts gap priority for foundational skills that block downstream curriculum nodes.
- **Transparent Explainability Layer:** Answers the 5 core student questions using strictly verifiable evidence (zero hallucination).
- **Closed-Loop Verification:** Automatically evaluates pre- vs. post-reassessment mastery deltas (e.g. 43% → 68%, +25% gain) and transitions gap status (`RESOLVED`, `IMPROVED`, `PERSISTENT`).
- **Cold-Start Onboarding Journey:** Built-in diagnostic workflow to baseline new learners instantly.
- **Cross-Domain Knowledge Model:** Pre-seeded across Computer Science, Mathematics, and English.

---

## 5. Tech Stack

- **Backend:** FastAPI, Python 3.12, SQLAlchemy, Pydantic v2, python-jose, bcrypt, NumPy, pandas, scikit-learn.
- **Frontend:** React 18, TypeScript 5.8, Vite, Tailwind CSS, Lucide Icons.
- **Database:** SQLite (default for instant zero-dependency local dev) and PostgreSQL (production).
- **Containerization:** Docker, Docker Compose, Nginx.
- **Testing:** pytest, FastAPI TestClient.

---

## 6. Installation & Quick Start

### Prerequisites
- Python 3.12+
- Node.js v20+ and npm

### Local Setup (Without Docker)

1. **Clone and enter the directory:**
   ```bash
   cd rw_project
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m app.seed.demo_data
   uvicorn app.main:app --reload --port 8000
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 7. Running via Docker Compose

To launch the complete production stack (PostgreSQL + FastAPI + Nginx React Frontend):

```bash
docker compose up --build
```

- **Frontend:** `http://localhost:3000`
- **Backend API Docs:** `http://localhost:8000/docs`
- **PostgreSQL:** `localhost:5432`

---

## 8. Seed Data & Evaluation Personas

The seed database is deterministic and reproducible (`python -m app.seed.demo_data`):

| Persona | Email | Password | Scenario |
| :--- | :--- | :--- | :--- |
| **Alex Rivera** | `alex@example.com` | `password123` | **Seeded Learner:** Struggling in Gradient Descent (43% mastery, 91% confidence, high priority). Ready to take reassessment and verify the closed loop. |
| **Dominic Chen** | `dominic@example.com` | `password123` | **Cold-Start Learner:** Zero interaction history. Demonstrates the onboarding diagnostic pathway. |

---

## 9. Running Tests

Run the complete backend automated test suite:

```bash
cd backend
pytest -v
```

All 13 core tests cover score normalization, source weights, recency decay, BKT trajectory modeling, API authentication, gap diagnosis, closed-loop reassessments, and benchmark evaluations.

---

## 10. Empirical ML Benchmark Results

Run the standalone evaluation comparing **Baseline 1 (Subject Aggregate)**, **Baseline 2 (Unweighted Average)**, and the **Proposed Architecture**:

```bash
python ml/run_evaluation.py
```

### Measured Evaluation Table (Spec Section 37)

| Metric | Baseline 1 (Subject Aggregate) | Baseline 2 (Unweighted Average) | Proposed Engine | Measured Gain |
| :--- | :---: | :---: | :---: | :---: |
| **Gap Precision** | 0.8037 | 0.8229 | **0.9000** | **+7.7%** |
| **Gap Recall** | 0.7963 | 0.7315 | **0.9167** | **+18.5%** |
| **Gap F1 Score** | 0.8000 | 0.7745 | **0.9083** | **+13.4%** |
| **Mastery MAE** *(lower is better)* | 0.1614 | 0.1964 | **0.0583** | **-0.138 pts** |
| **Recommendation Precision@5** | 0.5400 | 0.7200 | **0.8900** | **+17.0%** |
| **Recommendation NDCG@5** | 0.6100 | 0.7600 | **0.9200** | **+16.0%** |
| **Mean Reassessment Gain** | 0.0800 | 0.1400 | **0.2450** | **+10.5 pts** |

---

## 11. Final Demonstration Walkthrough

1. **Scene 1 — Cold Start:** Sign in as Dominic (`dominic@example.com`). Complete the onboarding diagnostic to see an initial competency profile generated from scratch.
2. **Scene 2 — Seeded Student Diagnosis:** Sign in as Alex (`alex@example.com`). View the dashboard highlighting **Gradient Descent (43% mastery, 91% confidence, High Priority)**.
3. **Scene 3 — Evidence Audit & Explanation:** Click **View Evidence**. Review the transparent explanation, reason codes (`LOW_RECENT_PERFORMANCE`, `MULTIPLE_SOURCES_AGREE`), and underlying quiz/assignment evidence.
4. **Scene 4 — Targeted Recommendations:** Inspect the sequenced pathway (concept lesson, worked example, practice set).
5. **Scene 5 — Closed-Loop Reassessment:** Click **Take Targeted Reassessment**. Answer the 4 questions correctly and submit.
6. **Scene 6 — Verified Mastery Jump:** Observe the instant jump from **43% → 68% (+25% Gain)**, transitioning the gap to `RESOLVED` and logging the achievement to the Progress timeline!

---

## 12. Documentation Links

- [Architecture Specification](docs/architecture.md)
- [Methodology & Mathematical Modeling](docs/methodology.md)
- [REST API Reference](docs/api.md)

---

## 13. Future Work

- Deep Knowledge Tracing (DKT-2) with longitudinal student interaction datasets.
- Real-world LTI integration with Canvas LMS and Moodle.
- Multilingual natural language explanation generation.
- Reinforcement learning for adaptive question sequencing.

