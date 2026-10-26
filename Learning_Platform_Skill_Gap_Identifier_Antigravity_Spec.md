# Learning Platform Skill Gap Identifier for Students

## Antigravity Implementation Specification

> **Purpose:** This document is the single implementation specification
> for building the project described in the project literature-review
> PPT. Antigravity should use this file as the source of truth for
> architecture, methodology, implementation, UI, APIs, data model, ML
> pipeline, evaluation, and expected deliverables.

------------------------------------------------------------------------

## 1. Project Identity

**Project:** Learning Platform Skill Gap Identifier for Students

**Core idea:** Build a closed-loop learning platform that collects
evidence from quizzes, assignments, gradebooks, diagnostic tests, and
student self-reports; converts that evidence into an evolving
**per-skill competency profile**; identifies and ranks skill gaps by
**severity and confidence**; explains each gap in plain language using
the evidence behind it; recommends targeted learning resources; and
reassesses the student after engagement.

### Core pipeline

``` text
Evidence Collection
       ↓
Evidence Normalization
       ↓
Skill Mapping
       ↓
Per-Skill Mastery Estimation
       ↓
Gap Detection
       ↓
Severity + Confidence Ranking
       ↓
Explainable Diagnosis
       ↓
Targeted Resource Recommendation
       ↓
Student Engagement
       ↓
Reassessment
       ↓
Updated Skill Profile
       ↺
```

The system must therefore be implemented as a **closed learning loop**,
not as a dashboard that only displays scores.

------------------------------------------------------------------------

# 2. Problem Statement

Students accumulate learning evidence across quizzes, assignments,
gradebooks, diagnostic tests, and self-reports. Most learning platforms
reduce this information to aggregate marks or subject-level scores.

The project addresses five core problems:

1.  Students cannot easily identify **which individual skills** they are
    weak in.
2.  A low score is usually not accompanied by an explanation of **why
    the system believes a skill is weak**.
3.  Diagnosis and recommendation are commonly separated instead of
    forming one workflow.
4.  Most knowledge-tracing systems focus on a particular subject or
    course rather than a cross-domain student profile.
5.  New students have little or no interaction history, creating a
    **cold-start problem**.

The proposed system solves these by maintaining an evolving,
explainable, cross-domain, skill-level learner profile.

------------------------------------------------------------------------

# 3. Objectives

The implementation must satisfy all six objectives from the project
specification.

### Objective 1 --- Collect Multi-Source Evidence

Support evidence from:

-   Quizzes
-   Assignments
-   Gradebook records
-   Diagnostic assessments
-   Student self-reports

The system must retain the original evidence and its source.

### Objective 2 --- Model Skills, Not Subjects

A student's profile must contain mastery estimates for individual
skills.

Example:

``` text
Subject: Machine Learning
    Linear Regression       0.84
    Logistic Regression     0.61
    Gradient Descent        0.43
    Model Evaluation        0.72
```

Do not represent the learner using only:

``` text
Machine Learning = 67%
```

### Objective 3 --- Detect and Rank Gaps

Each potentially weak skill must receive:

-   mastery estimate
-   severity
-   confidence
-   evidence count
-   supporting evidence
-   status

The system should prioritize the most actionable gaps.

### Objective 4 --- Explain Every Gap

Every detected gap must have a human-readable explanation.

Example:

> **Gradient Descent --- High Priority**
>
> Your estimated mastery is 43%. This is based on 5 recent quiz
> questions and 2 assignment items, where you answered 3
> gradient-descent questions incorrectly. Your latest evidence suggests
> difficulty with learning-rate selection.

The exact wording can be generated from structured evidence. The
explanation must never be an unsupported hallucination.

### Objective 5 --- Recommend and Reassess

For every important gap:

``` text
Gap → Recommended resources → Student engagement → Reassessment → Updated mastery
```

The recommendation should be linked to the diagnosed skill.

### Objective 6 --- Work Across Domains

The architecture must not hard-code the system to computer science.

Initial demonstration domains should include:

-   Computer Science
-   Mathematics
-   Languages

The same data model must support additional subjects.

------------------------------------------------------------------------

# 4. Research Basis

The project literature review covers 18 shortlisted papers organized
into three themes.

## Theme A --- Knowledge Tracing & Skill Modeling

Focus:

-   estimating per-skill mastery
-   tracking mastery over time
-   modeling student interaction data

Key finding from the project review:

> Knowledge tracing can estimate per-skill mastery effectively, but
> commonly outputs a probability rather than an actionable explanation.

## Theme B --- Diagnosis, Explainability & Cold-Start

Focus:

-   identifying misconceptions
-   explaining gaps
-   concept-level diagnosis
-   onboarding learners with limited history

The project identifies **ALIGNAgent** as the closest conceptual research
match.

Reference:

> Tokoli, B., Jaimes, L. & Dina, A. S. (2026). *ALIGNAgent: Adaptive
> Learner Intelligence for Gap Identification and Next-step Guidance*.
> arXiv:2601.15551.

The PPT states that ALIGNAgent processes quiz performance, gradebook
data, and learner preferences through a Skill Gap Agent and reports
precision of approximately **0.87--0.90** and F1 of approximately
**0.84--0.87** against real exam outcomes.

## Theme C --- Recommendation & Adaptive Learning Paths

Focus:

-   personalized resources
-   learning-path sequencing
-   adaptive recommendation

Key finding:

> Recommendation systems can sequence learning resources, but generally
> assume that a mastery diagnosis already exists.

------------------------------------------------------------------------

# 5. Research Gap the Project Must Address

The system should explicitly demonstrate the following research gaps
identified in the PPT.

### 5.1 Fragmented pipelines

Knowledge tracing, diagnosis, explanation, recommendation, and
reassessment are commonly studied separately.

**Project response:** implement one end-to-end pipeline.

### 5.2 Single-domain scope

Many systems are validated within one subject or a small number of
courses.

**Project response:** use a domain-independent skill model.

### 5.3 Shallow explanations

Explanations are often intended for instructors or dashboards rather
than individual learners.

**Project response:** produce per-student, per-skill, plain-language
explanations.

### 5.4 Cold-start + explainability

Cold-start and explainable diagnosis are generally treated separately.

**Project response:** create an onboarding diagnostic pathway that can
produce an initial competency profile before substantial interaction
history exists.

------------------------------------------------------------------------

# 6. Project Extension Over ALIGNAgent

The project is intended to build directly on the conceptual direction of
ALIGNAgent while extending it.

Required extensions:

1.  Add **diagnostic assessments** as an evidence source.
2.  Add **student self-reports** as an evidence source.
3.  Explicitly rank gaps by **severity**.
4.  Explicitly rank diagnosis by **confidence**.
5.  Support a **cross-domain skill profile**.
6.  Support **cold-start onboarding**.
7.  Add a formal **reassessment stage**.
8.  Update the learner profile after reassessment.
9.  Provide learner-facing explanations rather than only
    internal/instructor-oriented diagnosis.

These extensions should be visible in the implementation and final demo.

------------------------------------------------------------------------

# 7. System Architecture

Use a modular full-stack architecture.

``` text
┌───────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    React / Next.js                           │
│                                                               │
│ Dashboard │ Skill Profile │ Gaps │ Resources │ Assessment    │
└───────────────────────────────┬───────────────────────────────┘
                                │ REST / JSON
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                         BACKEND                               │
│                    FastAPI / Python                           │
│                                                               │
│ Auth │ Evidence │ Skills │ Diagnosis │ Recommendation         │
│ Assessment │ Reassessment │ Analytics │ Explainability        │
└───────────────┬───────────────┬──────────────┬────────────────┘
                │               │              │
                ▼               ▼              ▼
       ┌─────────────┐  ┌──────────────┐ ┌──────────────┐
       │ PostgreSQL  │  │ ML/Inference  │ │ Resource     │
       │             │  │ Pipeline      │ │ Catalog      │
       └─────────────┘  └──────────────┘ └──────────────┘
                                │
                                ▼
                       Skill/Mastery Engine
                                │
                                ▼
                      Explanation Generator
```

## Recommended implementation stack

This is an **engineering recommendation**, not a claim from the PPT.

### Frontend

-   React
-   TypeScript
-   Vite or Next.js
-   Tailwind CSS
-   Recharts
-   React Router if using Vite

### Backend

-   Python
-   FastAPI
-   Pydantic
-   SQLAlchemy
-   Alembic

### Database

-   PostgreSQL

### ML / Analytics

-   Python
-   NumPy
-   pandas
-   scikit-learn
-   PyTorch where a learned knowledge-tracing model is required

### Development

-   Git
-   GitHub
-   Docker / Docker Compose
-   `.env` configuration

### Optional AI layer

If an LLM is used for explanation generation, it must operate over
**structured diagnosis evidence** rather than independently deciding
that a skill is weak.

Recommended architecture:

``` text
Structured diagnosis
      ↓
Evidence JSON
      ↓
Explanation prompt
      ↓
LLM
      ↓
Plain-language explanation
```

The deterministic diagnosis engine remains the source of truth.

------------------------------------------------------------------------

# 8. Backend Module Architecture

Use the following logical modules.

``` text
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── subject.py
│   │   ├── skill.py
│   │   ├── assessment.py
│   │   ├── evidence.py
│   │   ├── mastery.py
│   │   ├── gap.py
│   │   ├── resource.py
│   │   ├── recommendation.py
│   │   └── reassessment.py
│   │
│   ├── schemas/
│   │   └── ...
│   │
│   ├── routers/
│   │   ├── auth.py
│   │   ├── students.py
│   │   ├── skills.py
│   │   ├── evidence.py
│   │   ├── diagnosis.py
│   │   ├── recommendations.py
│   │   ├── assessments.py
│   │   └── dashboard.py
│   │
│   ├── services/
│   │   ├── evidence_service.py
│   │   ├── skill_mapping_service.py
│   │   ├── mastery_service.py
│   │   ├── gap_detection_service.py
│   │   ├── explanation_service.py
│   │   ├── recommendation_service.py
│   │   └── reassessment_service.py
│   │
│   ├── ml/
│   │   ├── knowledge_tracing.py
│   │   ├── cold_start.py
│   │   ├── diagnosis.py
│   │   └── evaluation.py
│   │
│   └── seed/
│       └── demo_data.py
│
└── tests/
```

------------------------------------------------------------------------

# 9. Frontend Architecture

Recommended structure:

``` text
frontend/
├── src/
│   ├── components/
│   │   ├── SkillCard.tsx
│   │   ├── GapCard.tsx
│   │   ├── EvidenceList.tsx
│   │   ├── MasteryChart.tsx
│   │   ├── RecommendationCard.tsx
│   │   ├── AssessmentCard.tsx
│   │   └── ExplanationPanel.tsx
│   │
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SkillProfile.tsx
│   │   ├── SkillGapDetails.tsx
│   │   ├── Recommendations.tsx
│   │   ├── Assessment.tsx
│   │   └── Progress.tsx
│   │
│   ├── services/
│   │   └── api.ts
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── App.tsx
└── ...
```

------------------------------------------------------------------------

# 10. Core Data Model

Use a relational database.

## User

``` text
User
- id
- name
- email
- password_hash
- created_at
```

## Subject

``` text
Subject
- id
- name
- description
```

Examples:

``` text
Computer Science
Mathematics
English
```

## Skill

``` text
Skill
- id
- subject_id
- parent_skill_id
- name
- description
- difficulty
```

Skills should form a hierarchy where useful.

Example:

``` text
Machine Learning
├── Supervised Learning
│   ├── Linear Regression
│   └── Logistic Regression
├── Optimization
│   └── Gradient Descent
└── Evaluation
    ├── Accuracy
    ├── Precision
    └── Recall
```

## Evidence

``` text
Evidence
- id
- student_id
- skill_id
- source_type
- assessment_id
- raw_score
- normalized_score
- correctness
- confidence
- timestamp
- metadata
```

`source_type`:

``` text
QUIZ
ASSIGNMENT
GRADEBOOK
DIAGNOSTIC
SELF_REPORT
REASSESSMENT
```

## Assessment

``` text
Assessment
- id
- subject_id
- title
- type
- created_at
```

## Assessment Item

``` text
AssessmentItem
- id
- assessment_id
- skill_id
- question
- difficulty
- correct_answer
- options
```

## Student Response

``` text
StudentResponse
- id
- student_id
- assessment_item_id
- answer
- is_correct
- score
- response_time
- submitted_at
```

## Mastery

``` text
Mastery
- id
- student_id
- skill_id
- mastery_score
- confidence_score
- evidence_count
- last_updated
```

## Gap

``` text
Gap
- id
- student_id
- skill_id
- mastery_score
- severity_score
- confidence_score
- priority_score
- status
- explanation
- created_at
- updated_at
```

## Resource

``` text
Resource
- id
- skill_id
- title
- description
- resource_type
- url
- difficulty
- estimated_minutes
```

Resource types:

``` text
VIDEO
ARTICLE
TUTORIAL
PRACTICE
QUIZ
DOCUMENTATION
```

## Recommendation

``` text
Recommendation
- id
- student_id
- gap_id
- resource_id
- ranking_score
- reason
- status
- recommended_at
```

## Reassessment

``` text
Reassessment
- id
- student_id
- gap_id
- pre_mastery
- post_mastery
- improvement
- completed_at
```

------------------------------------------------------------------------

# 11. Evidence Processing Pipeline

All incoming evidence must be normalized into one common representation.

### Step 1 --- Ingest

Accept:

-   quiz results
-   assignment results
-   gradebook entries
-   diagnostic answers
-   self-report responses

### Step 2 --- Normalize

Convert scores to a common range:

``` text
normalized_score ∈ [0, 1]
```

For percentage scores:

``` text
normalized_score = percentage / 100
```

### Step 3 --- Map evidence to skills

Every quiz/assignment/diagnostic item should be associated with one or
more skills.

For multi-skill items, support weighted mappings:

``` json
{
  "skill_1": 0.7,
  "skill_2": 0.3
}
```

### Step 4 --- Apply evidence weighting

Evidence should not necessarily have equal importance.

Suggested starting weights:

``` text
Diagnostic       1.00
Reassessment     1.00
Quiz             0.85
Assignment       0.90
Gradebook        0.75
Self-report      0.40
```

These are implementation defaults and must be treated as tunable
parameters.

### Step 5 --- Apply recency

Recent evidence should have greater influence than very old evidence.

A simple decay model can be used:

``` text
recency_weight = exp(-λ × age_in_days)
```

### Step 6 --- Aggregate evidence

For each skill:

``` text
weighted_mastery =
    Σ(evidence_score × evidence_weight × recency_weight)
    ----------------------------------------------------
    Σ(evidence_weight × recency_weight)
```

The implementation should store the contributing evidence so that the
result remains explainable.

------------------------------------------------------------------------

# 12. Skill Mastery Model

The platform should maintain a mastery value between 0 and 1.

Interpretation:

``` text
0.00–0.39  Weak
0.40–0.59  Developing
0.60–0.79  Proficient
0.80–1.00  Strong
```

These thresholds are implementation defaults and should be configurable.

The mastery engine must also calculate confidence.

## Confidence

Confidence should increase when:

-   more evidence exists
-   evidence comes from reliable sources
-   evidence is recent
-   multiple evidence sources agree

Confidence should decrease when:

-   evidence count is low
-   evidence sources disagree
-   evidence is old
-   only self-report evidence exists

Example implementation:

``` text
confidence =
    evidence_coverage
    × source_reliability
    × consistency
    × recency
```

Clamp to:

``` text
0 ≤ confidence ≤ 1
```

------------------------------------------------------------------------

# 13. Knowledge Tracing

The project is conceptually grounded in knowledge tracing and per-skill
mastery estimation.

Implement the first version using a transparent mastery estimator based
on weighted evidence.

Then optionally support a learned model.

## Recommended progression

### Version 1

Weighted Bayesian-style / evidence aggregation model.

Advantages:

-   simple
-   explainable
-   works with limited data
-   cold-start compatible
-   easy to validate

### Version 2

Implement a knowledge-tracing model such as:

-   Bayesian Knowledge Tracing
-   Deep Knowledge Tracing
-   another suitable per-skill temporal model

Do not make the demo dependent on a deep model requiring a large
proprietary student dataset.

The system must remain functional with the project's seeded/demo
dataset.

------------------------------------------------------------------------

# 14. Cold-Start Methodology

A new student should not receive an empty dashboard.

Onboarding flow:

``` text
New Student
    ↓
Select subjects/interests
    ↓
Diagnostic assessment
    ↓
Initial skill estimates
    ↓
Confidence estimates
    ↓
Initial gap ranking
    ↓
First recommendations
```

The diagnostic should sample skills across the selected subject.

Example:

``` text
Mathematics
├── Algebra
├── Calculus
├── Probability
└── Statistics
```

A small number of diagnostic questions can establish an initial
estimate.

Self-report information may supplement the diagnostic, but should not
override objective evidence.

------------------------------------------------------------------------

# 15. Gap Detection

A skill should be considered a gap when mastery falls below a
configurable threshold.

Example:

``` text
if mastery_score < 0.60:
    gap = True
```

However, the final priority must consider more than mastery.

## Severity

Suggested formula:

``` text
severity = 1 - mastery_score
```

## Confidence

Use the previously calculated confidence.

## Priority

Recommended starting formula:

``` text
priority =
    severity ×
    confidence ×
    importance_weight
```

`importance_weight` can represent prerequisite importance.

Example:

``` text
Gradient Descent
mastery     = 0.43
severity    = 0.57
confidence  = 0.91
importance  = 1.00

priority = 0.5187
```

Sort gaps by descending priority.

------------------------------------------------------------------------

# 16. Prerequisite-Aware Diagnosis

Skills may depend on other skills.

Example:

``` text
Linear Regression
      ↓
Gradient Descent
      ↓
Neural Network Training
```

If a prerequisite skill is weak, it should influence recommendation
priority.

The system should therefore support a skill graph:

``` text
Skill A → Skill B
```

where the edge means:

> Skill A is a prerequisite for Skill B.

Use this information when ranking gaps and recommendations.

------------------------------------------------------------------------

# 17. Explainability Methodology

The explanation system must be evidence-first.

For each gap, construct an internal explanation object:

``` json
{
  "skill": "Gradient Descent",
  "mastery": 0.43,
  "confidence": 0.91,
  "severity": 0.57,
  "evidence": [
    {
      "source": "QUIZ",
      "score": 0.40,
      "date": "2026-09-20"
    },
    {
      "source": "ASSIGNMENT",
      "score": 0.50,
      "date": "2026-09-25"
    }
  ],
  "reason_codes": [
    "LOW_RECENT_PERFORMANCE",
    "MULTIPLE_SOURCES_AGREE"
  ]
}
```

Generate the learner-facing explanation from this object.

### Explanation must answer:

1.  What skill is weak?
2.  How strong/weak is the estimate?
3.  What evidence supports it?
4.  How confident is the system?
5.  What should the student do next?

### Example

> You may need more practice with Gradient Descent. Your estimated
> mastery is 43%, based mainly on recent quiz and assignment
> performance. Because multiple recent evidence sources show difficulty
> with this skill, the system has high confidence in this diagnosis.
> Start with the recommended Gradient Descent tutorial, then complete
> the short reassessment.

------------------------------------------------------------------------

# 18. LLM Explainability Rules

If an LLM is used:

### Allowed

-   Convert structured diagnosis into natural language.
-   Simplify technical terminology.
-   Produce a concise learner-friendly explanation.
-   Explain the evidence already supplied.

### Not allowed

-   Invent evidence.
-   Invent assessment results.
-   Change the mastery score.
-   Claim a misconception without evidence.
-   Diagnose a skill not present in the structured diagnosis.

The prompt should explicitly tell the model:

``` text
Only use the supplied structured evidence.
Do not invent student behavior or assessment results.
Do not modify numeric scores.
If evidence is insufficient, say that confidence is low.
```

------------------------------------------------------------------------

# 19. Recommendation Engine

The recommendation engine should map a diagnosed gap to resources.

Inputs:

``` text
student
skill
mastery
severity
confidence
difficulty
prerequisites
learning preferences
resource metadata
```

Recommendation score:

``` text
recommendation_score =
    skill_match
    × difficulty_match
    × gap_priority
    × preference_match
```

The first implementation can use deterministic scoring.

Example:

``` text
Skill match        0.95
Difficulty match   0.90
Gap priority       0.80
Preference match   0.90

score = 0.6156
```

Sort resources by score.

------------------------------------------------------------------------

# 20. Recommendation Types

For each gap, recommend a short sequence rather than an arbitrary
resource list.

Example:

``` text
1. 8-minute concept explanation
2. Worked example
3. 5-question practice quiz
4. Reassessment
```

The recommendation should become more difficult as mastery improves.

------------------------------------------------------------------------

# 21. Closed-Loop Reassessment

This is a critical project feature.

After a learner completes recommended resources:

``` text
Before:
Gradient Descent mastery = 0.43

       ↓
Learning resources
       ↓
Practice
       ↓
Reassessment

After:
Gradient Descent mastery = 0.68
```

Calculate:

``` text
improvement = post_mastery - pre_mastery
```

Update the skill profile.

### Gap status

Possible states:

``` text
OPEN
IN_PROGRESS
IMPROVED
RESOLVED
PERSISTENT
```

Example:

``` text
if post_mastery >= threshold:
    status = RESOLVED
else:
    status = PERSISTENT
```

If persistent, generate a new recommendation.

------------------------------------------------------------------------

# 22. Main User Journey

## Journey A --- New Student

``` text
Landing
 ↓
Sign up / Login
 ↓
Choose subjects
 ↓
Diagnostic assessment
 ↓
Initial skill profile
 ↓
Top skill gaps
 ↓
Recommendations
```

## Journey B --- Returning Student

``` text
Login
 ↓
Dashboard
 ↓
Updated skill profile
 ↓
Top gaps
 ↓
Evidence explanation
 ↓
Recommended resources
 ↓
Practice
 ↓
Reassessment
 ↓
Progress update
```

------------------------------------------------------------------------

# 23. Required Frontend Pages

## 23.1 Login

Simple authentication screen.

Fields:

-   email
-   password

Buttons:

-   Login
-   Create account

------------------------------------------------------------------------

## 23.2 Onboarding

Show:

-   selected subjects
-   short diagnostic
-   progress indicator

After completion:

> Your initial learning profile is ready.

------------------------------------------------------------------------

## 23.3 Dashboard

The dashboard is the primary screen.

Display:

### Header

``` text
Good morning, Dominic
Here's where you can improve next.
```

### Summary cards

-   Skills assessed
-   Strong skills
-   Developing skills
-   High-priority gaps

### Priority gaps

Show top 3--5.

Each card:

``` text
Gradient Descent
High priority

Mastery: 43%
Confidence: 91%

Why this appears:
Recent quiz and assignment performance indicate difficulty.

[View evidence] [Start learning]
```

### Mastery overview

Use a chart showing skills and mastery.

------------------------------------------------------------------------

# 24. Skill Profile Page

Display:

``` text
Computer Science
────────────────────────

Strong
████████████████░░ 84%
Linear Regression

Developing
████████████░░░░░░ 61%
Logistic Regression

Weak
████████░░░░░░░░░░ 43%
Gradient Descent
```

Allow filtering by:

-   subject
-   mastery level
-   recent changes

------------------------------------------------------------------------

# 25. Gap Details Page

This page is critical for demonstrating explainability.

Display:

``` text
Gradient Descent

Mastery       43%
Confidence    91%
Severity      High
Priority      High
```

Then:

### Why we think this is a gap

Show evidence cards.

``` text
Quiz
3 / 5 incorrect

Assignment
Below expected performance

Recent evidence
2 weeks ago
```

Then:

### Explanation

Plain-language diagnosis.

Then:

### What to do next

Recommended resources.

Then:

### Reassess

CTA:

``` text
Take reassessment
```

------------------------------------------------------------------------

# 26. Recommendation Page

Show recommendations grouped by skill.

Each recommendation:

``` text
Gradient Descent
Recommended because mastery is 43%.

[Video] 8 min
[Practice] 5 questions
[Reassessment]
```

Track completion.

------------------------------------------------------------------------

# 27. Progress Page

Show improvement over time.

Example:

``` text
Gradient Descent

Before recommendation: 43%
After reassessment:     68%

Improvement: +25 points
```

Also show resolved and persistent gaps.

------------------------------------------------------------------------

# 28. Assessment Engine

Assessment questions must be skill-linked.

Question model:

``` json
{
  "question": "Which parameter controls the step size in gradient descent?",
  "options": [
    "Learning rate",
    "Batch size",
    "Epoch count",
    "Activation function"
  ],
  "correct_answer": "Learning rate",
  "skill_id": "gradient_descent"
}
```

After submission:

1.  store response
2.  generate evidence
3.  update mastery
4.  recalculate gaps
5.  update recommendations

------------------------------------------------------------------------

# 29. API Design

Use REST APIs.

## Authentication

``` http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Students

``` http
GET /api/students/me
GET /api/students/me/profile
```

## Skills

``` http
GET /api/skills
GET /api/skills/{skill_id}
GET /api/students/me/skills
```

## Evidence

``` http
POST /api/evidence
GET  /api/students/me/evidence
```

## Diagnosis

``` http
GET /api/students/me/gaps
GET /api/students/me/gaps/{gap_id}
POST /api/students/me/diagnose
```

## Recommendations

``` http
GET  /api/students/me/recommendations
POST /api/recommendations/{id}/start
POST /api/recommendations/{id}/complete
```

## Assessment

``` http
GET  /api/assessments
GET  /api/assessments/{id}
POST /api/assessments/{id}/submit
```

## Reassessment

``` http
GET  /api/students/me/reassessments
POST /api/gaps/{gap_id}/reassess
```

------------------------------------------------------------------------

# 30. Example Diagnosis API Response

``` json
{
  "student_id": "student_001",
  "gaps": [
    {
      "skill_id": "skill_gradient_descent",
      "skill_name": "Gradient Descent",
      "mastery": 0.43,
      "severity": 0.57,
      "confidence": 0.91,
      "priority": 0.52,
      "status": "OPEN",
      "explanation": "Recent quiz and assignment evidence suggests difficulty with Gradient Descent.",
      "evidence_count": 7
    }
  ]
}
```

------------------------------------------------------------------------

# 31. Demo Dataset

The project must include a seeded dataset so that the full system works
without external integrations.

Create at least:

### Students

5--20 synthetic students.

### Subjects

At minimum:

``` text
Computer Science
Mathematics
English
```

### Skills

At least 8--12 skills per subject.

### Evidence

Hundreds of evidence records distributed across:

-   quizzes
-   assignments
-   gradebook
-   diagnostics
-   self-reports

### Resources

At least 3 resources per major skill.

### Assessments

At least:

-   1 diagnostic per subject
-   1 reassessment per major gap

The dataset should intentionally contain students with different
strengths and weaknesses so the dashboard demonstrates meaningful
diagnosis.

------------------------------------------------------------------------

# 32. Recommended Demo Student

Seed one clearly designed demo student whose profile demonstrates the
full pipeline.

Example:

``` text
Student: Alex

Strong:
- Python Basics       88%
- Linear Regression   82%

Developing:
- Logistic Regression 61%

Weak:
- Gradient Descent    43%
- Model Evaluation    48%
```

The demo should show:

``` text
Gradient Descent
43% mastery
91% confidence
High priority

↓ recommendation

Concept video
↓
Practice
↓
Reassessment

68% mastery
Gap improved
```

This creates a clear before/after demonstration.

------------------------------------------------------------------------

# 33. ML Methodology

The complete methodology should be presented as five stages.

## Stage 1 --- Evidence Acquisition

Collect heterogeneous student evidence.

## Stage 2 --- Skill-Level Modeling

Map evidence to individual skills and calculate mastery.

## Stage 3 --- Gap Diagnosis

Identify low-mastery skills and rank them using severity, confidence,
and prerequisite importance.

## Stage 4 --- Explainable Recommendation

Generate evidence-backed explanations and recommend resources matched to
the diagnosed gap.

## Stage 5 --- Reassessment

Measure the effect of the recommendation and update the learner profile.

------------------------------------------------------------------------

# 34. Overall Algorithm

``` text
Algorithm: Closed-Loop Skill Gap Identification

Input:
    Student S
    Evidence E
    Skill graph G
    Resource catalog R

1. Collect all available evidence for S.
2. Normalize every evidence record.
3. Map each evidence record to one or more skills.
4. Apply source reliability and recency weighting.
5. Estimate mastery for each skill.
6. Estimate confidence for each mastery value.
7. For each skill:
       severity = 1 - mastery
8. Apply prerequisite and importance weights.
9. Calculate priority score.
10. Rank all detected gaps.
11. Generate an evidence-backed explanation for each gap.
12. Match each gap with suitable resources.
13. Present highest-priority gaps and recommendations.
14. Record learner engagement.
15. Generate a reassessment.
16. Evaluate reassessment responses.
17. Update mastery and confidence.
18. Recalculate gaps.
19. Compare pre- and post-recommendation mastery.
20. Repeat the cycle.

Output:
    Updated per-skill competency profile
    Ranked skill gaps
    Explanations
    Personalized recommendations
    Progress/reassessment results
```

------------------------------------------------------------------------

# 35. Evaluation Methodology

The project should evaluate four major components separately.

## 35.1 Gap Detection

Metrics:

-   Precision
-   Recall
-   F1-score

Ground truth can be established from:

-   held-out assessment performance
-   expert-defined weak skills
-   simulated known student profiles

## 35.2 Mastery Estimation

Metrics:

-   MAE
-   RMSE
-   correlation with held-out assessment performance

## 35.3 Recommendation Quality

Metrics:

-   Precision@K
-   Recall@K
-   NDCG@K

For a student-facing prototype, also measure:

-   resource completion rate
-   reassessment participation
-   improvement after recommendation

## 35.4 Explainability

Evaluate whether explanations:

-   correctly reference evidence
-   correctly describe the diagnosed skill
-   preserve numeric values
-   are understandable to learners

A small human evaluation can use a 1--5 rating for:

``` text
Clarity
Evidence relevance
Trustworthiness
Actionability
```

------------------------------------------------------------------------

# 36. Experimental Design

Use a synthetic or publicly available educational dataset where
appropriate.

Split evidence temporally where possible:

``` text
Past evidence → model/profile construction
Future evidence → evaluation
```

Avoid leaking future assessment results into the diagnosis.

Compare:

### Baseline 1

Aggregate subject score only.

### Baseline 2

Simple per-skill weighted average.

### Proposed

Weighted evidence + recency + confidence + severity + prerequisite-aware
ranking + recommendation + reassessment.

If a learned knowledge-tracing model is implemented, compare it against
the simpler baseline.

------------------------------------------------------------------------

# 37. Expected Results

The PPT does **not** provide results from an implemented version of this
project. Therefore, do not claim experimental numbers as completed
results.

The implementation should produce results in the following format.

### Example results table

  Metric                            Baseline   Proposed
  ------------------------------- ---------- ----------
  Gap Precision                          TBD        TBD
  Gap Recall                             TBD        TBD
  Gap F1                                 TBD        TBD
  Mastery MAE                            TBD        TBD
  Recommendation Precision@5             TBD        TBD
  Recommendation NDCG@5                  TBD        TBD
  Mean reassessment improvement          TBD        TBD

The final report should replace `TBD` with actual measured values.

------------------------------------------------------------------------

# 38. Success Criteria

The project is successful when a user can:

1.  Create an account.
2.  Select subjects.
3.  Complete a diagnostic assessment.
4.  Receive a skill-level profile.
5.  See specific skill gaps.
6.  See severity and confidence.
7.  Open a gap and understand why it was detected.
8.  View the evidence supporting the diagnosis.
9.  Receive targeted resources.
10. Complete a learning activity.
11. Take a reassessment.
12. See updated mastery.
13. See whether the gap improved or persists.

The entire flow must work with seeded demo data.

------------------------------------------------------------------------

# 39. UI/UX Requirements

The interface should feel like a modern student learning product, not an
ML research dashboard.

Priorities:

-   clean
-   visual
-   easy to understand
-   minimal cognitive load
-   evidence visible on demand
-   clear calls to action

Use:

-   cards
-   progress bars
-   skill charts
-   priority indicators
-   concise explanations
-   resource cards

Avoid overwhelming students with raw model terminology.

Do not expose terms such as:

``` text
latent state
embedding
logits
Bayesian posterior
```

unless placed in an optional technical/debug view.

------------------------------------------------------------------------

# 40. Explainability UI Pattern

Every gap should follow:

``` text
┌────────────────────────────────────┐
│ Gradient Descent                   │
│ High Priority                      │
│                                    │
│ Mastery       43%                  │
│ Confidence    91%                  │
│                                    │
│ WHY THIS IS A GAP                  │
│ Your recent quiz and assignment   │
│ performance indicates difficulty  │
│ with this skill.                  │
│                                    │
│ EVIDENCE                            │
│ Quiz: 2/5 correct                  │
│ Assignment: below expected         │
│                                    │
│ NEXT STEP                           │
│ 8-min concept lesson               │
│ 5-question practice               │
│                                    │
│ [Start Learning]                   │
└────────────────────────────────────┘
```

------------------------------------------------------------------------

# 41. Security and Data Handling

Implement:

-   password hashing
-   JWT or secure session authentication
-   input validation with Pydantic
-   authorization so students can only access their own data
-   environment variables for secrets
-   no hard-coded API keys
-   server-side validation
-   database constraints

Do not store raw passwords.

If using an external LLM API, send only the minimum required educational
information.

------------------------------------------------------------------------

# 42. Configuration

Create `.env.example`.

Example:

``` env
DATABASE_URL=postgresql://user:password@localhost:5432/skillgap
SECRET_KEY=replace_me
LLM_API_KEY=optional
FRONTEND_URL=http://localhost:5173
```

Never commit `.env`.

------------------------------------------------------------------------

# 43. Docker Architecture

Provide:

``` text
docker-compose.yml
```

Services:

``` text
frontend
backend
postgres
```

Optional:

``` text
pgadmin
```

Expected local command:

``` bash
docker compose up --build
```

The project should start with as little manual configuration as
possible.

------------------------------------------------------------------------

# 44. Testing

Implement automated tests.

## Backend unit tests

Test:

-   score normalization
-   evidence weighting
-   recency weighting
-   mastery calculation
-   confidence calculation
-   severity
-   priority ranking
-   prerequisite handling
-   recommendation ranking
-   reassessment updates

## API tests

Test:

-   authentication
-   evidence submission
-   profile retrieval
-   gap retrieval
-   recommendation retrieval
-   assessment submission
-   reassessment

## Frontend tests

Test:

-   dashboard rendering
-   gap card rendering
-   navigation
-   assessment submission
-   recommendation completion

## End-to-end test

At minimum:

``` text
Register
→ Diagnostic
→ Diagnosis
→ View gap
→ Start resource
→ Reassessment
→ Updated mastery
```

------------------------------------------------------------------------

# 45. Error Handling

The UI should gracefully handle:

-   no evidence
-   insufficient evidence
-   low-confidence diagnosis
-   empty recommendations
-   failed assessment submission
-   backend unavailable
-   invalid assessment answer
-   duplicate submissions

Example:

> We don't have enough evidence to confidently identify a gap yet.
> Complete the recommended diagnostic to improve your profile.

This is preferable to displaying a misleading diagnosis.

------------------------------------------------------------------------

# 46. Low-Confidence Behavior

Do not call every low score a confirmed gap.

Example:

``` text
mastery = 0.35
confidence = 0.22
```

The UI should say:

> Early signal --- more evidence needed.

instead of:

> You are weak in this skill.

This is particularly important for cold-start students.

------------------------------------------------------------------------

# 47. Observability / Debugging

Add backend logging for:

``` text
evidence ingestion
mastery updates
gap detection
recommendation generation
reassessment
```

For development, expose a debug endpoint or admin view showing:

``` text
skill
mastery
confidence
evidence_count
severity
priority
```

Do not expose sensitive internal information to normal students.

------------------------------------------------------------------------

# 48. Seed Data Design

Create deterministic seed data.

Running:

``` bash
python -m app.seed.demo_data
```

should produce the same demonstration environment.

Seed:

``` text
Subjects
Skills
Skill relationships
Users
Assessments
Questions
Responses
Evidence
Resources
Recommendations
```

The demo should be reproducible.

------------------------------------------------------------------------

# 49. Development Order

Antigravity should implement in this order.

## Phase 1 --- Foundation

1.  Create repository.
2.  Create frontend and backend.
3.  Configure PostgreSQL.
4.  Add Docker Compose.
5.  Add environment configuration.
6.  Add database migrations.

## Phase 2 --- Core Data

7.  Implement User.
8.  Implement Subject.
9.  Implement Skill.
10. Implement Evidence.
11. Implement Assessment.
12. Implement Resource.

## Phase 3 --- Intelligence

13. Implement evidence normalization.
14. Implement skill mapping.
15. Implement mastery calculation.
16. Implement confidence.
17. Implement gap detection.
18. Implement severity.
19. Implement priority ranking.

## Phase 4 --- Explainability

20. Implement structured explanation objects.
21. Implement deterministic explanation templates.
22. Optionally add LLM natural-language generation.
23. Add evidence visualization.

## Phase 5 --- Recommendations

24. Implement resource matching.
25. Implement ranking.
26. Add recommendation API.
27. Add recommendation UI.

## Phase 6 --- Reassessment

28. Implement reassessment generation.
29. Implement response processing.
30. Update mastery.
31. Update gap state.
32. Display before/after improvement.

## Phase 7 --- UI

33. Login.
34. Onboarding.
35. Dashboard.
36. Skill profile.
37. Gap details.
38. Recommendations.
39. Progress.

## Phase 8 --- Testing

40. Unit tests.
41. API tests.
42. Frontend tests.
43. End-to-end flow.
44. Seed-data validation.

## Phase 9 --- Deployment

45. Production environment.
46. Deploy backend.
47. Deploy frontend.
48. Configure PostgreSQL.
49. Run migrations.
50. Verify complete demo flow.

------------------------------------------------------------------------

# 50. MVP vs Advanced Features

## MVP --- Must Have

-   Authentication
-   Multi-subject model
-   Skill hierarchy
-   Multi-source evidence
-   Per-skill mastery
-   Confidence
-   Gap detection
-   Severity
-   Priority ranking
-   Evidence-backed explanations
-   Resource recommendation
-   Diagnostic assessment
-   Reassessment
-   Updated mastery
-   Dashboard
-   Seeded demo data
-   PostgreSQL
-   REST API
-   Tests

## Advanced

-   Deep Knowledge Tracing
-   LLM explanations
-   Knowledge graph
-   Adaptive question difficulty
-   Real LMS integrations
-   Moodle integration
-   Canvas integration
-   Gmail/calendar integration
-   Teacher dashboard
-   Automated resource ingestion
-   Reinforcement-learning recommendation policy

Do not delay the core MVP for advanced features.

------------------------------------------------------------------------

# 51. Recommended Repository Structure

``` text
learning-platform-skill-gap/
│
├── frontend/
├── backend/
├── ml/
├── data/
│   ├── seed/
│   └── processed/
│
├── docs/
│   ├── architecture.md
│   ├── methodology.md
│   └── api.md
│
├── tests/
├── docker-compose.yml
├── README.md
├── .env.example
└── .gitignore
```

------------------------------------------------------------------------

# 52. README Requirements

The generated project README must include:

1.  Project overview
2.  Problem statement
3.  Architecture diagram
4.  Features
5.  Tech stack
6.  Installation
7.  Environment variables
8.  Database setup
9.  Seed-data instructions
10. Running locally
11. API documentation
12. ML methodology
13. Evaluation methodology
14. Example screenshots
15. Future work

------------------------------------------------------------------------

# 53. Final Demonstration Flow

The final demo should tell one coherent story.

### Scene 1 --- New student

> "This is a new student with almost no historical data."

Open onboarding.

### Scene 2 --- Diagnostic

Complete the diagnostic.

### Scene 3 --- Diagnosis

Show the generated skill profile.

Point out:

``` text
Gradient Descent — 43%
Confidence — 91%
High priority
```

### Scene 4 --- Explanation

Open the gap.

Show:

-   evidence
-   explanation
-   severity
-   confidence

### Scene 5 --- Recommendation

Click the recommended learning resource.

### Scene 6 --- Reassessment

Complete reassessment.

### Scene 7 --- Closed loop

Show:

``` text
43% → 68%
```

Then show:

> Gap improved.

This demonstrates the complete research contribution.

------------------------------------------------------------------------

# 54. Architecture Diagram for Report

Use the following conceptual architecture in the final
report/presentation:

``` text
                 ┌──────────────────────┐
                 │   Student Evidence   │
                 │ Quiz / Assignment    │
                 │ Gradebook / Diagnostic│
                 │ Self-report          │
                 └──────────┬───────────┘
                            ↓
                 ┌──────────────────────┐
                 │ Evidence Processing  │
                 │ Normalize + Map      │
                 │ Skills + Weighting   │
                 └──────────┬───────────┘
                            ↓
                 ┌──────────────────────┐
                 │ Skill Mastery Engine │
                 │ Mastery + Confidence │
                 └──────────┬───────────┘
                            ↓
                 ┌──────────────────────┐
                 │ Gap Detection Engine │
                 │ Severity + Priority  │
                 └──────────┬───────────┘
                            ↓
                 ┌──────────────────────┐
                 │ Explainability Layer │
                 │ Evidence-backed      │
                 │ learner explanation   │
                 └──────────┬───────────┘
                            ↓
                 ┌──────────────────────┐
                 │ Recommendation       │
                 │ Resource Ranking      │
                 └──────────┬───────────┘
                            ↓
                 ┌──────────────────────┐
                 │ Learning Resources   │
                 │ Video / Article /     │
                 │ Practice / Quiz       │
                 └──────────┬───────────┘
                            ↓
                 ┌──────────────────────┐
                 │ Reassessment Engine  │
                 └──────────┬───────────┘
                            │
                            └───────────────┐
                                            ↓
                                  Updated Skill Profile
```

------------------------------------------------------------------------

# 55. Important Implementation Constraints

Antigravity must follow these rules.

### Rule 1

Do not build a generic LMS.

The core product is **skill-gap identification and closed-loop
personalized learning**.

### Rule 2

Do not show only aggregate scores.

Every major student insight should be tied to a skill.

### Rule 3

Do not create unexplained AI scores.

Every diagnosis must retain evidence.

### Rule 4

Do not make the system dependent on an LLM.

The core diagnosis must work without an LLM.

### Rule 5

Do not hard-code one subject.

The subject and skill model must be configurable.

### Rule 6

Do not make cold-start an afterthought.

A new student must be supported through diagnostic onboarding.

### Rule 7

Do not stop at recommendations.

The project contribution includes reassessment and profile updates.

### Rule 8

Do not claim research results that have not been experimentally
measured.

The PPT's ALIGNAgent metrics are literature context, not results of this
implementation.

------------------------------------------------------------------------

# 56. Final Deliverables

The completed project should contain:

### Software

-   Working web application
-   Frontend
-   Backend API
-   PostgreSQL database
-   ML/diagnosis engine
-   Recommendation engine
-   Reassessment engine
-   Seed/demo data

### Documentation

-   README
-   Architecture document
-   API documentation
-   Methodology
-   Evaluation report

### Research outputs

-   Architecture diagram
-   Module list
-   Algorithms used per module
-   Baseline comparison
-   Results table
-   Screenshots
-   Limitations
-   Future work

### Demonstration

A complete:

``` text
Student
→ Diagnostic
→ Skill Profile
→ Gap
→ Explanation
→ Recommendation
→ Learning
→ Reassessment
→ Improved Profile
```

flow must be demonstrable without manually editing the database.

------------------------------------------------------------------------

# 57. Future Work

Potential extensions:

1.  Real LMS integrations.
2.  Larger longitudinal student datasets.
3.  Deep Knowledge Tracing.
4.  Cognitive diagnosis models.
5.  Knowledge graphs.
6.  Adaptive assessment difficulty.
7.  Teacher/instructor dashboard.
8.  Cross-course prerequisite modeling.
9.  Automated resource ingestion.
10. More sophisticated recommendation policies.
11. Multilingual learner explanations.
12. Mobile application.
13. Privacy-preserving learning analytics.

------------------------------------------------------------------------

# 58. Research References From the Project PPT

1.  Tokoli, B., Jaimes, L. & Dina, A. S. (2026). *ALIGNAgent: Adaptive
    Learner Intelligence for Gap Identification and Next-step Guidance*.
    arXiv:2601.15551.
2.  *Deep Learning Based Knowledge Tracing: A Review of the Literature*.
    (2025). Proc. ACM BDIE.
3.  *A survey of deep learning based knowledge tracing from a cognitive
    processing perspective*. (2025). ScienceDirect.
4.  Su, H., Liu, X., Yang, S., & Lu, X. (2023). *Deep knowledge tracing
    with learning curves*. Frontiers in Psychology.
5.  *On the Interpretability of Deep Learning Based Models for Knowledge
    Tracing*. (2021). AAAI.
6.  *A Systematic Review of Deep Knowledge Tracing (2015--2025)*.
    (2025). Preprints.org.
7.  *A Survey of Explainable Knowledge Tracing*. (2024).
    arXiv:2403.07279.
8.  *DKT2: Revisiting Applicable and Comprehensive Knowledge Tracing in
    Large-Scale Data*. (2025). arXiv:2501.14256.
9.  *The Correct Answer Trap: Detection and Feedback for Hidden
    Misconceptions*. (2025). arXiv:2606.23205.
10. *An Explainable AI Assistant for Introductory Programming
    Education*. (2026). arXiv:2606.12425.
11. *AI-Augmented Instruction: Real-Time Misconception Detection*.
    (2026). Proc. ACM SIGCSE.
12. Pal, S., Pramanik, P. K. D., & Choudhury, P. (2025). *Learner's
    intention analysis to mitigate the cold start problem*. Multimedia
    Tools and Applications.
13. *Hybrid attribute-based recommender system for personalized
    e-learning*. (2024). Frontiers in Computer Science.
14. *Personalized Learning Path Recommendation Based on Knowledge
    Graphs: A Survey*. (2026). MDPI Electronics.
15. *Simulation of personalized English learning path recommendation*.
    (2025). Scientific Reports.
16. *Personalized process-type learning path recommendation*. (2024).
    ScienceDirect.
17. *Data-Driven Personalized Learning Path Planning via Cognitive
    Diagnostic Assessments*. (2022). MDPI Applied Sciences.
18. *Cold-start Recommendation by Personalized Embedding Region
    Elicitation*. (2024). arXiv:2406.00973.
19. Türkmen, G. (2025). *The Review of Studies on Explainable AI in
    Educational Research*. SAGE.

------------------------------------------------------------------------

# 59. Antigravity Build Instruction

Build the application described in this specification as a
**production-quality prototype**, not a static mockup.

Prioritize:

1.  End-to-end functionality.
2.  Correct data flow.
3.  Explainable diagnosis.
4.  A polished student-facing UI.
5.  Reproducible seeded data.
6.  Testability.
7.  Clear separation between deterministic diagnosis and optional
    generative explanation.
8.  A complete closed-loop demonstration.

When an implementation choice is not explicitly specified above, choose
the simplest robust solution that preserves the project's central
research contribution.

The final application must make the following statement demonstrably
true:

> **The system converts scattered student learning evidence into a
> ranked, explainable, per-skill diagnosis, recommends targeted
> resources, and reassesses the learner to update the skill profile.**
