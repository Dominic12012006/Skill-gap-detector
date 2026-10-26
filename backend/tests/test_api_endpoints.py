import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_auth_login():
    response = client.post(
        "/api/auth/login",
        json={"email": "alex@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alex@example.com"

def test_get_subjects_and_skills():
    # Test subjects endpoint
    res_subj = client.get("/api/subjects")
    assert res_subj.status_code == 200
    subjects = res_subj.json()
    assert len(subjects) >= 3
    subj_names = [s["name"] for s in subjects]
    assert "Computer Science" in subj_names
    assert "Mathematics" in subj_names
    assert "English" in subj_names

    # Test skills endpoint
    res_skills = client.get("/api/skills")
    assert res_skills.status_code == 200
    skills = res_skills.json()
    assert len(skills) >= 15

def test_student_alex_profile_and_gaps():
    # Login as Alex
    login_res = client.post(
        "/api/auth/login",
        json={"email": "alex@example.com", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify Alex's skill masteries match spec (Linear Regression strong, Gradient Descent weak)
    res_skills = client.get("/api/students/me/skills", headers=headers)
    assert res_skills.status_code == 200
    skills_data = {s["skill_name"]: s for s in res_skills.json()}

    assert "Gradient Descent" in skills_data
    gd = skills_data["Gradient Descent"]
    assert gd["has_gap"] is True
    assert 0.38 <= gd["mastery_score"] <= 0.48
    assert gd["confidence_score"] >= 0.70

    # Verify diagnosed gaps
    res_gaps = client.get("/api/students/me/gaps", headers=headers)
    assert res_gaps.status_code == 200
    gaps_data = res_gaps.json()
    assert gaps_data["total_gaps"] >= 1
    
    top_gap = gaps_data["gaps"][0]
    assert top_gap["skill_name"] == "Gradient Descent"
    assert top_gap["severity_score"] > 0.50
    assert len(top_gap["evidence"]) >= 3
    assert "Gradient Descent" in top_gap["explanation"]
    assert len(top_gap["reason_codes"]) > 0

def test_recommendations_flow():
    login_res = client.post(
        "/api/auth/login",
        json={"email": "alex@example.com", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res_recs = client.get("/api/students/me/recommendations", headers=headers)
    assert res_recs.status_code == 200
    recs = res_recs.json()
    assert len(recs) >= 3

    # Start a recommendation
    rec_id = recs[0]["id"]
    res_start = client.post(f"/api/recommendations/{rec_id}/start", headers=headers)
    assert res_start.status_code == 200
    assert res_start.json()["status"] == "STARTED"

    # Complete a recommendation
    res_comp = client.post(f"/api/recommendations/{rec_id}/complete", headers=headers)
    assert res_comp.status_code == 200
    assert res_comp.json()["status"] == "COMPLETED"

def test_closed_loop_reassessment_improvement():
    login_res = client.post(
        "/api/auth/login",
        json={"email": "alex@example.com", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch active gaps
    res_gaps = client.get("/api/students/me/gaps", headers=headers)
    gaps = res_gaps.json()["gaps"]
    gd_gap = next((g for g in gaps if g["skill_name"] == "Gradient Descent"), None)
    assert gd_gap is not None

    pre_mastery = gd_gap["mastery_score"]

    # Fetch the targeted reassessment
    res_asms = client.get("/api/assessments?type=REASSESSMENT", headers=headers)
    asms = res_asms.json()
    assert len(asms) >= 1
    reassess_asm_id = asms[0]["id"]

    res_asm_detail = client.get(f"/api/assessments/{reassess_asm_id}", headers=headers)
    asm_detail = res_asm_detail.json()
    items = asm_detail["items"]
    assert len(items) >= 4

    # Submit 100% correct answers for reassessment
    answers_payload = [
        {"assessment_item_id": items[0]["id"], "selected_answer": "Learning rate"},
        {"assessment_item_id": items[1]["id"], "selected_answer": "Decrease the learning rate"},
        {"assessment_item_id": items[2]["id"], "selected_answer": "Zero vector"},
        {"assessment_item_id": items[3]["id"], "selected_answer": "SGD computes the gradient using one sample per update instead of the entire dataset"}
    ]

    res_reassess = client.post(
        f"/api/gaps/{gd_gap['id']}/reassess",
        json={"answers": answers_payload},
        headers=headers
    )
    assert res_reassess.status_code == 200
    result = res_reassess.json()

    assert result["post_mastery"] > pre_mastery
    assert result["improvement"] > 0.10
    assert result["status"] in ["RESOLVED", "IMPROVED", "PERSISTENT"]

    # Verify progress history logged
    res_history = client.get("/api/students/me/reassessments", headers=headers)
    assert res_history.status_code == 200
    assert len(res_history.json()) >= 1

def test_evaluation_benchmark_endpoint():
    res = client.get("/api/evaluation/benchmark")
    assert res.status_code == 200
    data = res.json()
    assert "metrics_table" in data
    assert len(data["metrics_table"]) >= 6

