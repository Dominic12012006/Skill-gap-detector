# Mathematical & Algorithmic Methodology

## 1. Evidence Acquisition & Normalization

The system ingests heterogeneous evidence records $e \in \mathcal{E}$ from six distinct educational channels:
- Quizzes (`QUIZ`, weight: 0.85)
- Course Assignments (`ASSIGNMENT`, weight: 0.90)
- Formal Gradebooks (`GRADEBOOK`, weight: 0.75)
- Cold-Start Diagnostics (`DIAGNOSTIC`, weight: 1.00)
- Student Self-Reports (`SELF_REPORT`, weight: 0.40)
- Targeted Reassessments (`REASSESSMENT`, weight: 1.00)

Raw percentage scores $S_{\text{raw}}$ are normalized to the unit interval:
$$S_{\text{norm}} = \text{clip}\left(\frac{S_{\text{raw}}}{S_{\text{max}}}, 0.0, 1.0\right)$$

---

## 2. Temporal Recency Decay

Recent student interactions have greater predictive validity than historical attempts. Recency weighting is modeled using continuous exponential decay:
$$w_{\text{recency}}(e) = \exp\left(-\lambda \cdot \Delta t\right)$$
where $\Delta t$ represents interaction age in days, and $\lambda = 0.05$ (corresponding to a half-life of ~14 days).

---

## 3. Skill Mastery & Epistemic Confidence Estimation

For each skill $k$, the composite mastery estimate $M_k$ is computed as the reliability- and recency-weighted mean of all contributing evidence:
$$M_k = \frac{\sum_{e \in \mathcal{E}_k} S_{\text{norm}}(e) \cdot w_{\text{source}}(e) \cdot w_{\text{recency}}(e)}{\sum_{e \in \mathcal{E}_k} w_{\text{source}}(e) \cdot w_{\text{recency}}(e)}$$

### Epistemic Confidence Formulation
Unlike conventional dashboards that treat all mastery estimates equally, our architecture computes an explicit confidence metric $C_k \in [0, 1]$ balancing four educational factors:
1. **Evidence Coverage** ($f_{\text{cov}}$): $\min(1.0, |\mathcal{E}_k| / 5.0)$ (saturates at 5 observations).
2. **Source Reliability** ($f_{\text{rel}}$): Mean source weight of contributing evidence.
3. **Internal Consistency** ($f_{\text{cons}}$): $1.0 - \min(0.5, 0.8 \cdot \sigma(\mathcal{E}_k))$.
4. **Temporal Freshness** ($f_{\text{rec}}$): Average recency weight.

$$\text{Confidence}_k = 0.45 f_{\text{cov}} + 0.25 f_{\text{rel}} + 0.15 f_{\text{cons}} + 0.15 f_{\text{rec}}$$

---

## 4. Prerequisite-Aware Gap Detection & Priority Ranking

A skill gap is detected when mastery falls below the proficiency threshold:
$$\text{IsGap}(k) \iff M_k < 0.60$$

### Severity
$$\text{Severity}_k = 1.0 - M_k$$

### Prerequisite Graph Weighting
If skill $k$ is a foundational prerequisite for downstream skills in the curriculum graph $G=(V, E)$, its remediation importance is elevated:
$$I_k = \min\left(1.40, 1.0 + 0.10 \cdot |\text{Dependents}(k)|\right)$$

### Final Priority Score
$$\text{Priority}_k = \text{Severity}_k \times \text{Confidence}_k \times I_k$$

Gaps are sorted in descending order of $\text{Priority}_k$.

---

## 5. Explainability Protocol

Every diagnosed gap generates a structured explanation answering five core student questions:
1. **What skill is weak?** (Skill name and curriculum category)
2. **How strong/weak is the estimate?** (Mastery percentage)
3. **What evidence supports it?** (Breakdown of quizzes, assignments, and diagnostics)
4. **How confident is the system?** (Confidence percentage and reason codes)
5. **What should the student do next?** (Specific learning resources and reassessment)

### Low-Confidence Epistemic Guardrail
When confidence is low ($C_k < 0.40$), the system informs the learner that the diagnosis is an **early signal requiring verification**, rather than asserting a confirmed deficiency.

---

## 6. Closed-Loop Reassessment State Machine

Following engagement with recommended learning materials, the student completes a targeted reassessment:
$$\Delta M = M_{\text{post}} - M_{\text{pre}}$$

Status transitions:
- $\text{RESOLVED}$: $M_{\text{post}} \ge 0.60$
- $\text{IMPROVED}$: $\Delta M \ge +0.15$ (with $M_{\text{post}} < 0.60$)
- $\text{PERSISTENT}$: $\Delta M < +0.15$ (triggers alternate pedagogical recommendations)

