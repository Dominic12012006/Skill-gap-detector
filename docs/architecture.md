# Architecture Specification

## Overview

The **Learning Platform Skill Gap Identifier for Students** is designed as a closed-loop learning platform that converts heterogeneous student learning evidence into an evolving, explainable per-skill competency profile, detects and ranks actionable gaps, recommends targeted resources, and verifies gains via reassessment.

```text
┌───────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│             React / TypeScript / Tailwind CSS / Vite          │
│                                                               │
│ Dashboard │ Skill Profile │ Gaps │ Resources │ Assessment    │
└───────────────────────────────┬───────────────────────────────┘
                                │ REST / JSON (JWT Auth)
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                         BACKEND                               │
│                    FastAPI / Python 3.12                      │
│                                                               │
│ Auth │ Evidence │ Skills │ Diagnosis │ Recommendation         │
│ Assessment │ Reassessment │ Analytics │ Explainability        │
└───────────────┬───────────────┬──────────────┬────────────────┘
                │               │              │
                ▼               ▼              ▼
       ┌─────────────┐  ┌──────────────┐ ┌──────────────┐
       │ PostgreSQL  │  │ ML/Inference  │ │ Resource     │
       │   / SQLite  │  │ Pipeline      │ │ Catalog      │
       └─────────────┘  └──────────────┘ └──────────────┘
                                │
                                ▼
                       Skill/Mastery Engine
                                │
                                ▼
                       Explanation Generator
```

---

## 1. Modular Backend Architecture

The backend is organized into decoupled domain modules:

- **`models/`**: SQLAlchemy declarative ORM mappings.
  - `User`: Student credentials, profile, and roles.
  - `Subject`: Multi-domain subjects (Computer Science, Mathematics, English).
  - `Skill`: Granular competency nodes with prerequisite directed edges (`skill_prerequisites`).
  - `Evidence`: Normalized heterogeneous logs with source tags, timestamps, and confidence.
  - `Assessment` & `AssessmentItem`: Curated questions with skill tags and options.
  - `StudentResponse`: Individual question submissions with latency and correctness.
  - `Mastery`: Persisted student skill proficiency and uncertainty/confidence scores.
  - `Gap`: Diagnosed deficits with severity, priority, reason codes, and natural language explanations.
  - `Resource`: Curated learning media (Videos, Tutorials, Practice Sets).
  - `Recommendation`: Ranked matchings linked to specific gaps.
  - `Reassessment`: Pre/post mastery audit logs recording closed-loop improvements.

- **`services/`**: Core deterministic business logic.
  - `evidence_service.py`: Score normalization ($\in [0, 1]$), exponential recency decay, and source weighting.
  - `mastery_service.py`: Multi-factor evidence aggregation and epistemic confidence calculation.
  - `gap_detection_service.py`: Prerequisite-aware gap identification, severity scoring, and priority ranking.
  - `explanation_service.py`: Evidence-backed plain language explanation generation answering the 5 spec questions.
  - `recommendation_service.py`: Curated learning path synthesis and interaction tracking.
  - `reassessment_service.py`: Closed-loop reassessment grading, mastery updating, and status transition.

- **`ml/`**: Machine Learning models and benchmark harnesses.
  - `knowledge_tracing.py`: Bayesian Knowledge Tracing (BKT) engine.
  - `cold_start.py`: Diagnostic sampling for zero-history onboarding.
  - `evaluation.py`: Comparative benchmark testbed evaluating Baselines against the Proposed architecture.

---

## 2. Frontend Architecture

The user interface is built with React 18, TypeScript, and Tailwind CSS:

- **Dashboard**: High-level KPI cards, top priority gap cards with "Why This Appears" explanations, domain mastery progress bars, and recent verified learning gains.
- **Skill Profile Matrix**: Granular multi-subject skill hierarchy with filterable status indicators (Weak, Developing, Proficient, Strong) and prerequisite links.
- **Explainable Gap Details**: Spec Section 40 layout displaying quantitative metrics, reason codes, underlying evidence table, and curated next steps.
- **Closed-Loop Reassessment Modal**: Interactive embedded quiz allowing learners to complete remediation and witness instantaneous before/after mastery jumps (e.g. 43% → 68%).
- **Cold-Start Onboarding**: Step-by-step diagnostic journey for new learners to eliminate empty dashboards.
- **Research Evaluation Benchmarks**: Live tabular comparison of Baseline 1, Baseline 2, and the Proposed architecture.

