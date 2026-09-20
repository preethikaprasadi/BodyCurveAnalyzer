"""
Unit tests for Machine Learning pipeline, feature engineering, and inference.
"""

import os
import pytest
import joblib
import pandas as pd
import numpy as np

from ml.preprocessing import FeatureEngineer, calculate_proportions, RAW_FEATURES, ALL_FEATURES

def test_dataset_integrity():
    """Verify generated dataset contains correct structure and balanced classes."""
    dataset_path = os.path.join("ml", "data", "body_measurements_dataset.csv")
    assert os.path.exists(dataset_path), "Dataset CSV must exist"
    
    df = pd.read_csv(dataset_path)
    assert len(df) == 3000
    expected_cols = set(RAW_FEATURES + ["body_shape"])
    assert expected_cols.issubset(set(df.columns))
    assert df.isnull().sum().sum() == 0, "No null values allowed in dataset"
    
    # Check 5 balanced classes
    counts = df["body_shape"].value_counts()
    assert len(counts) == 5
    for c in counts:
        assert c == 600

def test_feature_engineering_math():
    """Verify manual calculation matches FeatureEngineer output."""
    sample = {
        "height": 165.0,
        "weight": 60.0,
        "shoulder": 38.0,
        "bust": 90.0,
        "waist": 68.0,
        "hip": 94.0,
    }
    
    proportions = calculate_proportions(sample)
    expected_bmi = round(60.0 / ((165.0 / 100.0) ** 2), 2)
    expected_whr = round(68.0 / 94.0, 3)
    expected_shr = round(38.0 / 94.0, 3)
    
    assert proportions["bmi"] == expected_bmi
    assert proportions["waistHipRatio"] == expected_whr
    assert proportions["shoulderHipRatio"] == expected_shr

def test_feature_engineer_transformer():
    """Verify FeatureEngineer transformer appends all engineered columns properly."""
    df_raw = pd.DataFrame([{
        "height": 170.0,
        "weight": 65.0,
        "shoulder": 39.0,
        "bust": 92.0,
        "waist": 70.0,
        "hip": 95.0,
    }])
    
    fe = FeatureEngineer()
    transformed = fe.transform(df_raw)
    assert transformed.shape == (1, len(ALL_FEATURES))

def test_pipeline_loading_and_prediction():
    """Verify champion pipeline loads from backend/ml/pipeline.pkl and predicts valid output."""
    pipeline_path = os.path.join("backend", "ml", "pipeline.pkl")
    assert os.path.exists(pipeline_path), "Pipeline pickle must exist in backend/ml/"
    
    pipeline = joblib.load(pipeline_path)
    assert hasattr(pipeline, "predict")
    assert hasattr(pipeline, "predict_proba")
    
    sample_input = pd.DataFrame([{
        "height": 165.0,
        "weight": 60.0,
        "shoulder": 36.0,
        "bust": 92.0,
        "waist": 64.0,
        "hip": 93.0,
    }])
    
    prediction = pipeline.predict(sample_input)
    assert len(prediction) == 1
    assert prediction[0] in ["hourglass", "rectangle", "pear", "inverted_triangle", "apple"]
    
    probabilities = pipeline.predict_proba(sample_input)[0]
    assert len(probabilities) == 5
    assert np.isclose(np.sum(probabilities), 1.0, atol=1e-4)

def test_pipeline_edge_cases():
    """Verify pipeline handles boundary values gracefully without throwing errors."""
    pipeline_path = os.path.join("backend", "ml", "pipeline.pkl")
    pipeline = joblib.load(pipeline_path)
    
    # Boundary tests: tall/lean, short/stocky
    test_cases = [
        {"height": 200.0, "weight": 70.0, "shoulder": 42.0, "bust": 88.0, "waist": 72.0, "hip": 90.0},
        {"height": 145.0, "weight": 90.0, "shoulder": 38.0, "bust": 115.0, "waist": 110.0, "hip": 112.0},
    ]
    
    for case in test_cases:
        df_case = pd.DataFrame([case])
        pred = pipeline.predict(df_case)
        assert pred[0] in ["hourglass", "rectangle", "pear", "inverted_triangle", "apple"]
