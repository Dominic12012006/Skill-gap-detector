# REST API Documentation

Base URL: `http://localhost:8000/api`

---

## 1. Authentication

### `POST /auth/register`
Creates a new student account.
- **Request Body**:
  ```json
  {
    "name": "Alex Rivera",
    "email": "alex@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK` with JWT token and user profile.

### `POST /auth/login`
Authenticates a user and returns a bearer access token.
- **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "password123"
  }
  ```

### `GET /auth/me`
Returns current authenticated user details.

---

## 2. Skills & Subjects

### `GET /subjects`
Returns the list of supported subjects (`Computer Science`, `Mathematics`, `English`).

### `GET /skills`
Lists all skills, optionally filtered by `?subject_id=`. Includes prerequisite edge lists.

### `GET /students/me/skills`
Returns the student's evolving per-skill competency profile:
- `skill_name`, `difficulty`, `mastery_score`, `confidence_score`, `evidence_count`, `mastery_level`, `has_gap`.

---

## 3. Evidence Ingestion

### `POST /evidence`
Logs a new piece of evidence into the system and triggers asynchronous mastery recalculation.
- **Request Body**:
  ```json
  {
    "skill_id": 3,
    "source_type": "QUIZ",
    "raw_score": 40.0,
    "max_score": 100.0,
    "correctness": false,
    "confidence": 1.0,
    "metadata": { "topic": "optimization" }
  }
  ```

### `GET /students/me/evidence`
Retrieves timestamped audit logs for the authenticated student.

---

## 4. Diagnosis & Gaps

### `GET /students/me/gaps`
Returns detected skill gaps sorted by descending priority.
- **Response Structure**:
  ```json
  {
    "student_id": 1,
    "total_gaps": 2,
    "gaps": [
      {
        "id": 1,
        "skill_id": 3,
        "skill_name": "Gradient Descent",
        "mastery_score": 0.43,
        "severity_score": 0.57,
        "confidence_score": 0.91,
        "priority_score": 0.52,
        "status": "OPEN",
        "explanation": "You need additional practice with Gradient Descent...",
        "reason_codes": ["LOW_RECENT_PERFORMANCE", "MULTIPLE_SOURCES_AGREE"],
        "evidence": [...]
      }
    ]
  }
  ```

### `GET /students/me/gaps/{gap_id}`
Returns complete diagnostic breakdown for a specific gap.

### `POST /students/me/diagnose`
Forces an immediate re-evaluation of all masteries and ranking of detected gaps.

---

## 5. Recommendations

### `GET /students/me/recommendations`
Returns personalized learning sequences ranked by `skill_match * difficulty_match * gap_priority`.

### `POST /recommendations/{id}/start`
Marks a recommendation as `STARTED`.

### `POST /recommendations/{id}/complete`
Marks a recommendation as `COMPLETED`.

---

## 6. Assessments & Closed-Loop Reassessment

### `GET /assessments`
Lists available assessments (Diagnostic, Quiz, Reassessment).

### `GET /assessments/{id}`
Retrieves assessment questions and multiple-choice options.

### `POST /assessments/{id}/submit`
Grades submission, injects evidence records, updates masteries, and recalculates gaps.

### `POST /gaps/{gap_id}/reassess`
Executes closed-loop reassessment for a diagnosed gap.
- **Request Body**:
  ```json
  {
    "answers": [
      { "assessment_item_id": 7, "selected_answer": "Learning rate" },
      { "assessment_item_id": 8, "selected_answer": "Decrease the learning rate" }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "reassessment_id": 1,
    "gap_id": 1,
    "skill_id": 3,
    "skill_name": "Gradient Descent",
    "pre_mastery": 0.43,
    "post_mastery": 0.68,
    "improvement": 0.25,
    "status": "RESOLVED",
    "score_percentage": 100.0
  }
  ```

### `GET /students/me/reassessments`
Returns longitudinal reassessment logs showing verified gains over time.

---

## 7. Evaluation Benchmark

### `GET /evaluation/benchmark`
Executes empirical benchmark evaluating Baseline 1 (Subject Aggregate), Baseline 2 (Unweighted Average), and the Proposed Architecture on held-out interaction sequences.

