"""
Measurements and progress tracking API routes.
"""

from flask import Blueprint, request, jsonify
from backend.schemas.validation import validate_measurements
from backend.models.database import (
    save_measurement,
    get_measurements,
    get_measurement_by_id,
    delete_measurement,
    get_progress_timeline,
)

measurements_bp = Blueprint("measurements", __name__, url_prefix="/api")

@measurements_bp.route("/measurements", methods=["POST"])
def create_measurement():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "JSON payload required."}), 400

    is_valid, parsed, errors = validate_measurements(data)
    if not is_valid:
        return jsonify({"success": False, "error": "Validation failed.", "details": errors}), 400

    try:
        payload = {
            **parsed,
            "bodyShape": data.get("bodyShape", "unknown"),
            "confidence": float(data.get("confidence", 1.0)),
            "userId": data.get("userId", "guest"),
            "date": data.get("date"),
            "notes": data.get("notes", "")
        }
        saved = save_measurement(payload)
        return jsonify({"success": True, "data": saved}), 201
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to save measurement: {str(e)}"}), 500

@measurements_bp.route("/measurements", methods=["GET"])
def list_measurements():
    user_id = request.args.get("userId", "guest")
    limit = int(request.args.get("limit", 100))
    try:
        records = get_measurements(user_id=user_id, limit=limit)
        return jsonify({"success": True, "count": len(records), "data": records}), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to list measurements: {str(e)}"}), 500

@measurements_bp.route("/measurements/<int:measurement_id>", methods=["GET"])
def get_single_measurement(measurement_id: int):
    try:
        record = get_measurement_by_id(measurement_id)
        if not record:
            return jsonify({"success": False, "error": "Measurement record not found."}), 404
        return jsonify({"success": True, "data": record}), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to fetch record: {str(e)}"}), 500

@measurements_bp.route("/measurements/<int:measurement_id>", methods=["DELETE"])
def remove_measurement(measurement_id: int):
    try:
        deleted = delete_measurement(measurement_id)
        if not deleted:
            return jsonify({"success": False, "error": "Measurement record not found."}), 404
        return jsonify({"success": True, "message": f"Measurement {measurement_id} successfully deleted."}), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to delete record: {str(e)}"}), 500

@measurements_bp.route("/progress", methods=["GET"])
def get_progress():
    user_id = request.args.get("userId", "guest")
    try:
        progress_data = get_progress_timeline(user_id=user_id)
        return jsonify({"success": True, "data": progress_data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to fetch progress: {str(e)}"}), 500
