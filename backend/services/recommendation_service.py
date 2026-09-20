"""
Recommendation Service for BodyCurve Analyzer.
Retrieves and tailors rule-based fitness, wellness, and fashion guidance
according to body shape, user goal, and activity level.
"""

import os
import json
from typing import Dict, Any, Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "recommendations.json")

GOAL_MODIFIERS = {
    "muscle_gain": {
        "title": "Muscle Tone & Hypertrophy Focus",
        "guidance": "Prioritize progressive overload with 8-12 rep ranges, ensuring adequate protein intake (1.6 - 2.2g/kg) and calorie surplus or maintenance."
    },
    "fat_loss": {
        "title": "Fat Loss & Conditioning Focus",
        "guidance": "Combine resistance training with calorie-aware whole foods and consistent daily step goals (8,000-10,000 steps) to preserve lean muscle."
    },
    "maintain": {
        "title": "Balance & Maintenance Focus",
        "guidance": "Maintain current fitness capacity through balanced full-body strength routines, intuitive whole-food nutrition, and functional mobility."
    },
    "mobility": {
        "title": "Mobility & Posture Alignment Focus",
        "guidance": "Emphasize joint range of motion, thoracic spine opening, core stability, and gentle daily dynamic stretching."
    }
}

ACTIVITY_MODIFIERS = {
    "beginner": {
        "frequency": "2-3 sessions per week",
        "intensity": "Moderate intensity, focusing primarily on movement technique and establishing consistency."
    },
    "intermediate": {
        "frequency": "3-4 sessions per week",
        "intensity": "Moderate-to-high intensity with progressive resistance and varied exercise stimulus."
    },
    "advanced": {
        "frequency": "4-5 sessions per week",
        "intensity": "High intensity, incorporating periodized volume, tempo control, and structured deload weeks."
    }
}

class RecommendationService:
    _data: Optional[Dict[str, Any]] = None

    @classmethod
    def _load_data(cls) -> Dict[str, Any]:
        if cls._data is None:
            if not os.path.exists(DATA_PATH):
                raise FileNotFoundError(f"Recommendations data file not found at: {DATA_PATH}")
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                cls._data = json.load(f)
        return cls._data

    @classmethod
    def get_recommendations(
        cls,
        body_shape: str,
        goal: str = "maintain",
        activity_level: str = "beginner"
    ) -> Dict[str, Any]:
        """
        Retrieve recommendations customized by shape, fitness goal, and activity level.
        """
        data = cls._load_data()
        normalized_shape = str(body_shape).lower().strip()

        # Fallback to hourglass if shape not found
        shape_data = data.get(normalized_shape, data.get("hourglass"))

        goal_key = str(goal).lower().strip()
        goal_info = GOAL_MODIFIERS.get(goal_key, GOAL_MODIFIERS["maintain"])

        activity_key = str(activity_level).lower().strip()
        activity_info = ACTIVITY_MODIFIERS.get(activity_key, ACTIVITY_MODIFIERS["beginner"])

        # Deep copy structure
        rec = {
            "bodyShape": normalized_shape,
            "displayName": shape_data.get("displayName", normalized_shape.title()),
            "summary": shape_data.get("summary", ""),
            "goalCustomization": {
                "selectedGoal": goal_key,
                "title": goal_info["title"],
                "guidance": goal_info["guidance"]
            },
            "activityCustomization": {
                "selectedLevel": activity_key,
                "frequency": activity_info["frequency"],
                "intensity": activity_info["intensity"]
            },
            "fitness": shape_data.get("fitness", {}),
            "wellness": shape_data.get("wellness", {}),
            "fashion": shape_data.get("fashion", {})
        }
        return rec
