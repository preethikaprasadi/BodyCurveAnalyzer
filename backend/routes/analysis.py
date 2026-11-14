"""
Analysis API route.
Handles POST /api/analyze:
- Validates input body measurements
- Runs ML inference
- Generates personalized recommendations
- Optionally persists measurement record
"""

from flask import Blueprint, request, jsonify
from backend.schemas.validation import validate_measurements
from backend.services.ml_service import get_ml_service
from backend.services.recommendation_service import RecommendationService
from backend.models.database import save_measurement

analysis_bp = Blueprint("analysis", __name__, url_prefix="/api")

@analysis_bp.route("/analyze", methods=["POST"])
def analyze_body_measurements():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({
            "success": False,
            "error": "Invalid request. JSON payload required."
        }), 400

    # 1. Validation
    is_valid, parsed_measurements, errors = validate_measurements(data)
    if not is_valid:
        return jsonify({
            "success": False,
            "error": "Validation failed.",
            "details": errors
        }), 400

    # 2. ML Inference with Gender Support
    gender = str(data.get("gender", "female")).lower().strip()
    if gender not in ["female", "male"]:
        gender = "female"

    try:
        ml_service = get_ml_service()
        prediction_result = ml_service.predict(parsed_measurements, gender=gender)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"ML Inference failed: {str(e)}"
        }), 500

    # 3. Recommendation Generation with Gender Support
    goal = data.get("goal", "maintain")
    activity_level = data.get("activityLevel", "beginner")

    recommendations = RecommendationService.get_recommendations(
        body_shape=prediction_result["bodyShape"],
        gender=gender,
        goal=goal,
        activity_level=activity_level
    )

    # 4. Optional Auto-save
    saved_record = None
    if data.get("saveRecord", False):
        try:
            save_payload = {
                **parsed_measurements,
                "bodyShape": prediction_result["bodyShape"],
                "confidence": prediction_result["confidence"],
                "userId": data.get("userId", "guest"),
                "gender": gender,
                "date": data.get("date"),
                "notes": data.get("notes", "")
            }
            saved_record = save_measurement(save_payload)
        except Exception as e:
            # Non-blocking warning if saving fails
            saved_record = {"error": f"Failed to auto-save: {str(e)}"}

    response_payload = {
        "success": True,
        "inputMeasurements": parsed_measurements,
        "analysis": prediction_result,
        "recommendations": recommendations,
        "savedRecord": saved_record,
    }

    return jsonify(response_payload), 200
