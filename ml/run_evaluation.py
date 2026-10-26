import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.ml.evaluation import evaluate_models_on_dataset

def main():
    print("=" * 80)
    print("  CLOSED-LOOP SKILL GAP IDENTIFIER: EMPIRICAL BENCHMARK EVALUATION")
    print("  Comparing Baseline 1 (Subject Aggregate), Baseline 2 (Unweighted Average),")
    print("  and Proposed Architecture (Multi-source Weighted + Recency + Confidence)")
    print("=" * 80)
    
    results = evaluate_models_on_dataset()
    print(f"\nEvaluated on {results['sample_size']} held-out interaction sequences.\n")

    header = f"{'Metric':<34} | {'Baseline 1':<10} | {'Baseline 2':<10} | {'Proposed':<10} | {'Gain'}"
    print(header)
    print("-" * len(header))
    
    for row in results["metrics_table"]:
        print(f"{row['metric']:<34} | {row['baseline_1_subject_score']:<10} | {row['baseline_2_unweighted_avg']:<10} | {row['proposed_engine']:<10} | {row['improvement']}")

    print("\n" + "=" * 80)
    print("Evaluation completed successfully.")

if __name__ == "__main__":
    main()

