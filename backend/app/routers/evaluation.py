from fastapi import APIRouter
from app.ml.evaluation import evaluate_models_on_dataset

router = APIRouter(prefix="/evaluation", tags=["Evaluation & Benchmarks"])

@router.get("/benchmark")
def get_benchmark_results():
    """Returns the comparative results table comparing Baseline 1, Baseline 2, and Proposed architecture."""
    return evaluate_models_on_dataset()

