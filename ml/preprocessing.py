"""
Preprocessing and feature engineering module for BodyCurve Analyzer.

Includes:
- Mathematical feature derivation (BMI, WHR, SHR, WBR, BHR).
- Scikit-learn compliant FeatureEngineer transformer.
- Proportions calculation helper for UI explainability.
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

RAW_FEATURES: List[str] = ["height", "weight", "shoulder", "bust", "waist", "hip"]

ENGINEERED_FEATURES: List[str] = [
    "bmi",
    "waist_hip_ratio",
    "shoulder_hip_ratio",
    "waist_bust_ratio",
    "bust_hip_ratio",
]

ALL_FEATURES: List[str] = RAW_FEATURES + ENGINEERED_FEATURES

class FeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Scikit-learn compatible transformer that takes raw measurements
    and appends engineered anthropometric ratios.
    """

    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        """
        Transform raw measurement matrix/DataFrame into full feature set.
        """
        if isinstance(X, pd.DataFrame):
            df = X.copy()
        else:
            df = pd.DataFrame(X, columns=RAW_FEATURES)

        # Enforce numeric types
        for col in RAW_FEATURES:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        # Feature derivations
        height_m = df["height"] / 100.0
        df["bmi"] = df["weight"] / (height_m ** 2)
        df["waist_hip_ratio"] = df["waist"] / df["hip"]
        df["shoulder_hip_ratio"] = df["shoulder"] / df["hip"]
        df["waist_bust_ratio"] = df["waist"] / df["bust"]
        df["bust_hip_ratio"] = df["bust"] / df["hip"]

        # Ensure consistent column ordering
        return df[ALL_FEATURES].values

def calculate_proportions(measurements: Dict[str, float], gender: str = "female") -> Dict[str, Any]:
    """
    Calculate anthropometric proportions and indices for a single user record.
    Used by the API to provide model explainability.
    
    Args:
        measurements: Dict with keys 'height', 'weight', 'shoulder', 'bust', 'waist', 'hip'.
        gender: 'female' or 'male' (default: 'female')
        
    Returns:
        Dict with computed indices rounded for user display.
    """
    height = float(measurements["height"])
    weight = float(measurements["weight"])
    shoulder = float(measurements["shoulder"])
    bust = float(measurements["bust"])
    waist = float(measurements["waist"])
    hip = float(measurements["hip"])
    is_male = str(gender).lower().strip() == "male"

    height_m = height / 100.0
    bmi = weight / (height_m ** 2)
    whr = waist / hip
    shr = shoulder / hip
    wbr = waist / bust
    bhr = bust / hip
    cwr = bust / waist  # Chest-to-Waist ratio (key metric for men)

    # Determine gender-specific BMI interpretations and categories
    if bmi < 18.5:
        bmi_category = "Underweight"
    elif bmi < 24.9:
        bmi_category = "Normal weight"
    elif bmi < 29.9:
        bmi_category = "Overweight (Muscular Frame)" if is_male else "Overweight"
    else:
        bmi_category = "Obesity"

    # Gender-specific WHR assessment based on WHO standards
    if is_male:
        if whr < 0.85:
            whr_category = "Athletic V-Taper"
        elif whr <= 0.90:
            whr_category = "Optimal Male Proportion"
        elif whr <= 0.95:
            whr_category = "Moderate Risk / Straight"
        else:
            whr_category = "Elevated Central Adiposity"
    else:
        if whr <= 0.75:
            whr_category = "Defined Waist / Hourglass"
        elif whr <= 0.80:
            whr_category = "Healthy Female Proportion"
        elif whr <= 0.85:
            whr_category = "Moderate Waist Definition"
        else:
            whr_category = "Elevated Central Adiposity"

    return {
        "bmi": round(bmi, 2),
        "bmiCategory": bmi_category,
        "waistHipRatio": round(whr, 3),
        "waistHipCategory": whr_category,
        "shoulderHipRatio": round(shr, 3),
        "waistBustRatio": round(wbr, 3),
        "bustHipRatio": round(bhr, 3),
        "chestWaistRatio": round(cwr, 3),
        "gender": "male" if is_male else "female",
    }
