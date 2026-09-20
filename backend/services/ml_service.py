"""
Production ML Inference Service for BodyCurve Analyzer.
Loads the serialized Scikit-learn pipeline and serves predictions with probabilities and ratios.
"""

import os
import sys
import json
import joblib
import pandas as pd
from typing import Dict, Any, Optional

# Ensure project root is in path for custom transformers (FeatureEngineer)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.preprocessing import calculate_proportions, RAW_FEATURES

DISPLAY_NAMES = {
    "hourglass": "Hourglass",
    "rectangle": "Rectangle",
    "pear": "Pear / Triangle",
    "inverted_triangle": "Inverted Triangle",
    "apple": "Apple / Oval",
}

SHAPE_DESCRIPTIONS = {
    "hourglass": "Balanced bust and hip measurements with a distinctly defined, narrower waist.",
    "rectangle": "Athletic, straight silhouette where shoulders, bust, waist, and hips follow an even line.",
    "pear": "Hips and lower torso are the widest proportion, with narrower shoulders and bust.",
    "inverted_triangle": "Upper torso and shoulders are noticeably broader than the hips and lower body.",
    "apple": "Central volume distribution around the waist and midsection, with relatively slender limbs.",
}

class MLInferenceService:
    _instance: Optional["MLInferenceService"] = None

    def __init__(self, model_path: Optional[str] = None, metadata_path: Optional[str] = None):
        if model_path is None:
            model_path = os.path.join(PROJECT_ROOT, "backend", "ml", "pipeline.pkl")
        if metadata_path is None:
            metadata_path = os.path.join(PROJECT_ROOT, "backend", "ml", "metadata.json")

        self.model_path = model_path
        self.metadata_path = metadata_path
        self.pipeline = None
        self.metadata = {}
        self.classes = []
        self._load_pipeline()

    def _load_pipeline(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model pipeline not found at {self.model_path}. Run ml/train.py to generate it."
            )
        self.pipeline = joblib.load(self.model_path)

        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, "r") as f:
                self.metadata = json.load(f)
                self.classes = self.metadata.get("classes", [])
        else:
            self.classes = list(self.pipeline.classes_)

    @classmethod
    def get_instance(cls) -> "MLInferenceService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def predict(self, measurements: Dict[str, float]) -> Dict[str, Any]:
        """
        Run inference on validated input measurements.
        
        Args:
            measurements: Dict with height, weight, shoulder, bust, waist, hip.
            
        Returns:
            Dict containing classification, probability, confidence, proportions, and description.
        """
        df_input = pd.DataFrame([measurements])[RAW_FEATURES]

        # Classification prediction
        predicted_class = str(self.pipeline.predict(df_input)[0])

        # Model probability distribution
        has_proba = hasattr(self.pipeline, "predict_proba")
        probabilities = {}
        confidence = 1.0

        if has_proba:
            raw_probs = self.pipeline.predict_proba(df_input)[0]
            classes = getattr(self.pipeline, "classes_", self.classes)
            for cls_name, prob in zip(classes, raw_probs):
                probabilities[cls_name] = round(float(prob), 4)

            confidence = probabilities.get(predicted_class, 1.0)

        # Proportions and derived ratios
        proportions = calculate_proportions(measurements)

        return {
            "bodyShape": predicted_class,
            "displayName": DISPLAY_NAMES.get(predicted_class, predicted_class.title()),
            "description": SHAPE_DESCRIPTIONS.get(predicted_class, ""),
            "confidence": round(float(confidence), 3),
            "probabilities": probabilities,
            "proportions": proportions,
            "modelUsed": self.metadata.get("champion_model", "Logistic Regression"),
        }

def get_ml_service() -> MLInferenceService:
    return MLInferenceService.get_instance()
