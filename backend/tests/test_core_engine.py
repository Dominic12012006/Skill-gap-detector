import pytest
from datetime import datetime, timedelta
from app.services.evidence_service import normalize_score, calculate_recency_weight, get_source_weight
from app.services.mastery_service import compute_mastery_and_confidence, get_mastery_level_label
from app.ml.knowledge_tracing import BayesianKnowledgeTracing
from app.ml.evaluation import evaluate_models_on_dataset

class MockEvidence:
    def __init__(self, source_type, normalized_score, confidence=1.0, days_ago=0):
        self.source_type = source_type
        self.normalized_score = normalized_score
        self.confidence = confidence
        self.timestamp = datetime.utcnow() - timedelta(days=days_ago)

def test_normalization():
    assert normalize_score(80, 100) == 0.80
    assert normalize_score(0, 100) == 0.0
    assert normalize_score(150, 100) == 1.0  # Clamped
    assert normalize_score(-10, 100) == 0.0  # Clamped

def test_source_weights():
    assert get_source_weight("DIAGNOSTIC") == 1.00
    assert get_source_weight("REASSESSMENT") == 1.00
    assert get_source_weight("QUIZ") == 0.85
    assert get_source_weight("ASSIGNMENT") == 0.90
    assert get_source_weight("SELF_REPORT") == 0.40

def test_recency_decay():
    now = datetime.utcnow()
    w_fresh = calculate_recency_weight(now)
    w_old = calculate_recency_weight(now - timedelta(days=30))
    assert w_fresh > w_old
    assert w_fresh <= 1.0

def test_mastery_and_confidence():
    # Empty evidence -> neutral mastery, 0 confidence
    m_empty, c_empty = compute_mastery_and_confidence([])
    assert m_empty == 0.50
    assert c_empty == 0.0

    # Strong performance across multiple quizzes and assignments
    ev_strong = [
        MockEvidence("QUIZ", 0.90, days_ago=2),
        MockEvidence("ASSIGNMENT", 0.85, days_ago=5),
        MockEvidence("DIAGNOSTIC", 0.95, days_ago=10),
        MockEvidence("GRADEBOOK", 0.88, days_ago=3),
    ]
    m_val, c_val = compute_mastery_and_confidence(ev_strong)
    assert 0.80 <= m_val <= 1.0
    assert c_val >= 0.50
    assert get_mastery_level_label(m_val) == "Strong"

    # Weak performance on gradient descent
    ev_weak = [
        MockEvidence("QUIZ", 0.40, days_ago=2),
        MockEvidence("QUIZ", 0.40, days_ago=5),
        MockEvidence("ASSIGNMENT", 0.45, days_ago=8),
        MockEvidence("GRADEBOOK", 0.42, days_ago=12),
        MockEvidence("SELF_REPORT", 0.35, days_ago=3),
    ]
    m_weak, c_weak = compute_mastery_and_confidence(ev_weak)
    assert 0.38 <= m_weak <= 0.46
    assert c_weak >= 0.70
    assert get_mastery_level_label(m_weak) == "Developing" or get_mastery_level_label(m_weak) == "Weak"

def test_bayesian_knowledge_tracing():
    bkt = BayesianKnowledgeTracing(p_init=0.2, p_transit=0.15, p_slip=0.1, p_guess=0.2)
    # Consecutive correct answers should monotonically increase knowledge
    trajectory = bkt.trace_sequence([True, True, True])
    assert trajectory[0] < trajectory[1] < trajectory[2]
    assert trajectory[2] > 0.70

def test_evaluation_benchmark_metrics():
    res = evaluate_models_on_dataset()
    assert "metrics_table" in res
    metrics = {m["metric"]: m for m in res["metrics_table"]}
    
    # Proposed should have lower MAE than baselines
    assert metrics["Mastery MAE (lower is better)"]["proposed_engine"] < metrics["Mastery MAE (lower is better)"]["baseline_1_subject_score"]
    assert metrics["Mastery MAE (lower is better)"]["proposed_engine"] < metrics["Mastery MAE (lower is better)"]["baseline_2_unweighted_avg"]
    
    # Proposed should have higher F1 than baselines
    assert metrics["Gap F1 Score"]["proposed_engine"] > metrics["Gap F1 Score"]["baseline_1_subject_score"]

