"""
Machine learning training and benchmarking pipeline for BodyCurve Analyzer.

Trains and evaluates 4 lightweight classifiers:
1. Logistic Regression
2. Decision Tree
3. Random Forest
4. K-Nearest Neighbors

Performs Stratified 5-Fold Cross-Validation, evaluates on holdout test set,
and packages the best performing pipeline with Scikit-learn FeatureEngineer and StandardScaler.
"""

import os
import sys
import time
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier

from ml.preprocessing import FeatureEngineer, RAW_FEATURES

def benchmark_models(
    dataset_path: str = "ml/data/body_measurements_dataset.csv",
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Load dataset, train 4 candidate classifiers, evaluate metrics, and save champion model.
    """
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at: {dataset_path}. Please run generate_dataset.py first.")

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    X = df[RAW_FEATURES]
    y = df["body_shape"]

    # Stratified 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=random_state, stratify=y
    )

    print(f"Training samples: {len(X_train)} | Test samples: {len(X_test)}")
    classes = sorted(y.unique().tolist())
    print(f"Classes: {classes}")

    candidate_models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=random_state),
        "Decision Tree": DecisionTreeClassifier(max_depth=6, random_state=random_state),
        "Random Forest": RandomForestClassifier(n_estimators=50, max_depth=8, random_state=random_state),
        "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=5),
    }

    results = {}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)

    best_model_name = None
    best_f1_score = -1.0
    best_pipeline = None

    print("\n" + "=" * 80)
    print(f"{'Model':<22} | {'Train Time':<10} | {'CV F1 (std)':<14} | {'Test Acc':<9} | {'Macro F1':<9}")
    print("=" * 80)

    for name, clf in candidate_models.items():
        # Build end-to-end pipeline
        pipe = Pipeline([
            ("features", FeatureEngineer()),
            ("scaler", StandardScaler()),
            ("classifier", clf),
        ])

        # Measure training time
        start_time = time.perf_counter()
        pipe.fit(X_train, y_train)
        train_time = time.perf_counter() - start_time

        # 5-fold cross-validation on training split
        cv_scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="f1_macro")
        cv_mean = float(np.mean(cv_scores))
        cv_std = float(np.std(cv_scores))

        # Holdout test set evaluation
        y_pred = pipe.predict(X_test)
        acc = float(accuracy_score(y_test, y_pred))
        prec_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
        rec_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
        f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
        f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

        cm = confusion_matrix(y_test, y_pred, labels=classes).tolist()
        report = classification_report(y_test, y_pred, labels=classes, output_dict=True)

        results[name] = {
            "training_time_seconds": round(train_time, 4),
            "cv_f1_macro_mean": round(cv_mean, 4),
            "cv_f1_macro_std": round(cv_std, 4),
            "test_accuracy": round(acc, 4),
            "test_precision_macro": round(prec_macro, 4),
            "test_recall_macro": round(rec_macro, 4),
            "test_f1_macro": round(f1_macro, 4),
            "test_f1_weighted": round(f1_weighted, 4),
            "confusion_matrix": cm,
            "classification_report": report,
        }

        print(f"{name:<22} | {train_time*1000:>7.2f} ms | {cv_mean:.4f} (±{cv_std:.3f}) | {acc*100:>7.2f}% | {f1_macro:.4f}")

        # Champion model selection based on CV F1 score
        if cv_mean > best_f1_score:
            best_f1_score = cv_mean
            best_model_name = name
            best_pipeline = pipe

    print("=" * 80)
    print(f"\nChampion Model Selected: {best_model_name} (CV Macro F1: {best_f1_score:.4f})")

    # Serialize champion pipeline and metadata
    os.makedirs("ml", exist_ok=True)
    os.makedirs("backend/ml", exist_ok=True)

    champion_path_ml = os.path.join("ml", "pipeline.pkl")
    champion_path_backend = os.path.join("backend", "ml", "pipeline.pkl")

    joblib.dump(best_pipeline, champion_path_ml)
    joblib.dump(best_pipeline, champion_path_backend)
    print(f"Serialized pipeline saved to:\n  - {champion_path_ml}\n  - {champion_path_backend}")

    metadata = {
        "champion_model": best_model_name,
        "classes": classes,
        "raw_features": RAW_FEATURES,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "champion_metrics": results[best_model_name],
        "all_benchmarks": results,
    }

    with open("ml/benchmark_results.json", "w") as f:
        json.dump(metadata, f, indent=2)

    with open("backend/ml/metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print("Benchmark results written to ml/benchmark_results.json and backend/ml/metadata.json")
    return metadata

if __name__ == "__main__":
    benchmark_models()
