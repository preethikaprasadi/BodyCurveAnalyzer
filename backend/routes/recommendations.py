"""
Recommendations API route.
Handles GET /api/recommendations?bodyShape=...&goal=...&activityLevel=...
"""

from flask import Blueprint, request, jsonify
from backend.services.recommendation_service import RecommendationService

recommendations_bp = Blueprint("recommendations", __name__, url_prefix="/api")

@recommendations_bp.route("/recommendations", methods=["GET"])
def get_recommendations():
    body_shape = request.args.get("bodyShape", "hourglass")
    goal = request.args.get("goal", "maintain")
    activity_level = request.args.get("activityLevel", "beginner")

    try:
        recommendations = RecommendationService.get_recommendations(
            body_shape=body_shape,
            goal=goal,
            activity_level=activity_level
        )
        return jsonify({
            "success": True,
            "data": recommendations
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve recommendations: {str(e)}"
        }), 500
