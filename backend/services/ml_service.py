"""
Production ML Inference Service for BodyCurve Analyzer.
Loads gender-specific Scikit-learn pipelines and serves predictions with calibrated probabilities and ratios.
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
    "trapezoid": "Trapezoid",
    "triangle": "Triangle / A-Frame",
    "oval": "Oval / Round",
}

SHAPE_DESCRIPTIONS = {
    # Female descriptions
    "hourglass": "Balanced bust and hip measurements with a distinctly defined, narrower waist.",
    "pear": "Hips and lower torso are the widest proportion, with narrower shoulders and bust.",
    "apple": "Central volume distribution around the waist and midsection, with relatively slender limbs.",
    # Male descriptions
    "trapezoid": "The classic athletic male build: broad chest and shoulders with a gentle, balanced taper to the waist and hips.",
    "triangle": "Lower torso (waist and hips) is wider than the chest and shoulders, creating an A-frame silhouette.",
    "oval": "Central torso volume concentrated around the abdomen and waist, with narrower shoulders and hips.",
    # Shared shape descriptions
    "rectangle_female": "Athletic, straight silhouette where shoulders, bust, waist, and hips follow an even line.",
    "rectangle_male": "Straight athletic build where chest, waist, and hips follow an even line with minimal taper.",
    "inverted_triangle_female": "Upper torso and shoulders are noticeably broader than the hips and lower body.",
    "inverted_triangle_male": "Prominent athletic V-taper with broad shoulders and chest tapering down to a lean waist and hips.",
}

class MLInferenceService:
    _instance: Optional["MLInferenceService"] = None

    def __init__(self):
        self.model_dir = os.path.join(PROJECT_ROOT, "backend", "ml")
        self.pipeline_female = None
        self.pipeline_male = None
        self.metadata_female = {}
        self.metadata_male = {}
        self.classes_female = []
        self.classes_male = []
        self._load_pipelines()

    def _load_pipelines(self):
        # 1. Load Female Pipeline
        female_path = os.path.join(self.model_dir, "pipeline_female.pkl")
        fallback_path = os.path.join(self.model_dir, "pipeline.pkl")
        target_female = female_path if os.path.exists(female_path) else fallback_path

        if os.path.exists(target_female):
            self.pipeline_female = joblib.load(target_female)
            meta_path = os.path.join(self.model_dir, "metadata_female.json")
            if not os.path.exists(meta_path):
                meta_path = os.path.join(self.model_dir, "metadata.json")
            if os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    self.metadata_female = json.load(f)
                    self.classes_female = self.metadata_female.get("classes", [])
            else:
                self.classes_female = list(self.pipeline_female.classes_)
        else:
            raise FileNotFoundError(f"Model pipeline not found at {target_female}. Run ml/train.py.")

        # 2. Load Male Pipeline
        male_path = os.path.join(self.model_dir, "pipeline_male.pkl")
        if os.path.exists(male_path):
            self.pipeline_male = joblib.load(male_path)
            meta_path = os.path.join(self.model_dir, "metadata_male.json")
            if os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    self.metadata_male = json.load(f)
                    self.classes_male = self.metadata_male.get("classes", [])
            else:
                self.classes_male = list(self.pipeline_male.classes_)
        else:
            # Fallback to female pipeline if male is not yet trained
            self.pipeline_male = self.pipeline_female
            self.metadata_male = self.metadata_female
            self.classes_male = self.classes_female

    @classmethod
    def get_instance(cls) -> "MLInferenceService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def predict(self, measurements: Dict[str, float], gender: str = "female") -> Dict[str, Any]:
        """
        Run inference on validated input measurements with gender-specific models.
        
        Args:
            measurements: Dict with height, weight, shoulder, bust, waist, hip.
            gender: 'female' or 'male' (default: 'female')
            
        Returns:
            Dict containing classification, probability, confidence, proportions, and description.
        """
        is_male = str(gender).lower().strip() == "male"
        pipe = self.pipeline_male if is_male else self.pipeline_female
        metadata = self.metadata_male if is_male else self.metadata_female
        classes = self.classes_male if is_male else self.classes_female

        df_input = pd.DataFrame([measurements])[RAW_FEATURES]

        # Classification prediction
        predicted_class = str(pipe.predict(df_input)[0])

        # Model probability distribution
        has_proba = hasattr(pipe, "predict_proba")
        probabilities = {}
        confidence = 1.0

        if has_proba:
            raw_probs = pipe.predict_proba(df_input)[0]
            pipe_classes = getattr(pipe, "classes_", classes)
            for cls_name, prob in zip(pipe_classes, raw_probs):
                probabilities[cls_name] = round(float(prob), 4)

            confidence = probabilities.get(predicted_class, 1.0)

        # Proportions and derived ratios
        proportions = calculate_proportions(measurements, gender="male" if is_male else "female")

        # Gender-sensitive description lookup
        desc_key = f"{predicted_class}_{'male' if is_male else 'female'}"
        description = SHAPE_DESCRIPTIONS.get(desc_key) or SHAPE_DESCRIPTIONS.get(predicted_class, "")

        return {
            "bodyShape": predicted_class,
            "displayName": DISPLAY_NAMES.get(predicted_class, predicted_class.title()),
            "description": description,
            "confidence": round(float(confidence), 3),
            "probabilities": probabilities,
            "proportions": proportions,
            "gender": "male" if is_male else "female",
            "modelUsed": metadata.get("champion_model", "Logistic Regression"),
        }

def get_ml_service() -> MLInferenceService:
    return MLInferenceService.get_instance()
