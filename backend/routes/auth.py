"""
Authentication and user profile routes for BodyCurve Analyzer.
Implements JWT tokens, password hashing, and token verification decorators.
"""

import os
import re
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Optional, Dict, Any

import jwt
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from backend.models.database import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    update_user_profile,
)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "bodycurve-jwt-development-secret-key-2026")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_DAYS = 7

def generate_token(user_id: str, email: str) -> str:
    """Generate a signed JWT token valid for 7 days."""
    payload = {
        "sub": user_id,
        "email": email,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRY_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def token_required(f):
    """Decorator to require a valid Bearer token for protected routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "error": "Authorization token required."}), 401

        token = auth_header.split(" ", 1)[1].strip()
        payload = decode_token(token)
        if not payload:
            return jsonify({"success": False, "error": "Invalid or expired token."}), 401

        user = get_user_by_id(payload["sub"])
        if not user:
            return jsonify({"success": False, "error": "User account no longer exists."}), 401

        return f(user, *args, **kwargs)
    return decorated

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "JSON payload required."}), 400

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    errors = []
    if not name or len(name) < 2:
        errors.append("Name must be at least 2 characters long.")
    if not email or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        errors.append("Valid email address required.")
    if not password or len(password) < 6:
        errors.append("Password must be at least 6 characters long.")

    if errors:
        return jsonify({"success": False, "error": "Validation failed.", "details": errors}), 400

    # Check for existing email
    existing = get_user_by_email(email)
    if existing:
        return jsonify({"success": False, "error": "An account with this email already exists."}), 409

    # Hash password and create record
    password_hash = generate_password_hash(password)
    user = create_user(
        name=name,
        email=email,
        password_hash=password_hash,
        age_range=data.get("ageRange", ""),
        gender=data.get("gender", ""),
        goal=data.get("goal", "maintain"),
        activity_level=data.get("activityLevel", "beginner"),
    )

    token = generate_token(user["id"], user["email"])
    return jsonify({
        "success": True,
        "token": token,
        "user": user,
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "JSON payload required."}), 400

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required."}), 400

    user_record = get_user_by_email(email)
    if not user_record or not check_password_hash(user_record.get("password_hash", ""), password):
        return jsonify({"success": False, "error": "Invalid email or password."}), 401

    token = generate_token(user_record["id"], user_record["email"])
    sanitized_user = {
        "id": user_record["id"],
        "name": user_record["name"],
        "email": user_record["email"],
        "ageRange": user_record.get("age_range", ""),
        "gender": user_record.get("gender", ""),
        "goal": user_record.get("goal", "maintain"),
        "activityLevel": user_record.get("activity_level", "beginner"),
    }

    return jsonify({
        "success": True,
        "token": token,
        "user": sanitized_user,
    }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user(current_user):
    return jsonify({
        "success": True,
        "user": current_user,
    }), 200

@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile(current_user):
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "JSON payload required."}), 400

    updated = update_user_profile(current_user["id"], data)
    return jsonify({
        "success": True,
        "user": updated,
    }), 200
