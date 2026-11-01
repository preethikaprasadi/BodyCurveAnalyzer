"""
SQLite database access and persistence layer for BodyCurve Analyzer.
Lightweight, thread-safe, and zero-daemon overhead.
"""

import os
import sqlite3
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "bodycurve.db")

def get_db_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    target_path = db_path or DB_PATH
    conn = sqlite3.connect(target_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path: Optional[str] = None):
    """Initialize database tables if they do not exist."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()

        # Measurements table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS measurements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL DEFAULT 'guest',
                date TEXT NOT NULL,
                height REAL NOT NULL,
                weight REAL NOT NULL,
                shoulder REAL NOT NULL,
                bust REAL NOT NULL,
                waist REAL NOT NULL,
                hip REAL NOT NULL,
                body_shape TEXT NOT NULL,
                confidence REAL NOT NULL,
                bmi REAL,
                waist_hip_ratio REAL,
                shoulder_hip_ratio REAL,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Users table (with authentication fields)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL DEFAULT '',
                age_range TEXT DEFAULT '',
                gender TEXT DEFAULT '',
                goal TEXT DEFAULT 'maintain',
                activity_level TEXT DEFAULT 'beginner',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Safe schema migration for pre-existing tables
        cursor.execute("PRAGMA table_info(users)")
        existing_cols = [row[1] for row in cursor.fetchall()]
        if "password_hash" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN password_hash TEXT DEFAULT ''")
        if "age_range" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN age_range TEXT DEFAULT ''")
        if "gender" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN gender TEXT DEFAULT ''")

        conn.commit()

def save_measurement(data: Dict[str, Any], db_path: Optional[str] = None) -> Dict[str, Any]:
    """Insert a new measurement record and return the saved object."""
    date_str = data.get("date") or datetime.now().strftime("%Y-%m-%d")
    user_id = data.get("userId") or data.get("user_id") or "guest"

    height = float(data["height"])
    weight = float(data["weight"])
    shoulder = float(data["shoulder"])
    bust = float(data["bust"])
    waist = float(data["waist"])
    hip = float(data["hip"])
    body_shape = str(data["bodyShape"] if "bodyShape" in data else data.get("body_shape", "unknown"))
    confidence = float(data.get("confidence", 1.0))

    height_m = height / 100.0
    bmi = round(weight / (height_m ** 2), 2)
    whr = round(waist / hip, 3)
    shr = round(shoulder / hip, 3)
    notes = data.get("notes", "")

    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO measurements (
                user_id, date, height, weight, shoulder, bust, waist, hip,
                body_shape, confidence, bmi, waist_hip_ratio, shoulder_hip_ratio, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, date_str, height, weight, shoulder, bust, waist, hip,
              body_shape, confidence, bmi, whr, shr, notes))
        conn.commit()
        inserted_id = cursor.lastrowid

    return {
        "id": inserted_id,
        "userId": user_id,
        "date": date_str,
        "height": height,
        "weight": weight,
        "shoulder": shoulder,
        "bust": bust,
        "waist": waist,
        "hip": hip,
        "bodyShape": body_shape,
        "confidence": confidence,
        "bmi": bmi,
        "waistHipRatio": whr,
        "shoulderHipRatio": shr,
        "notes": notes,
    }

def get_measurements(user_id: Optional[str] = None, limit: int = 100, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve historical measurements ordered by date descending."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        if user_id:
            cursor.execute("""
                SELECT * FROM measurements
                WHERE user_id = ?
                ORDER BY date DESC, id DESC
                LIMIT ?
            """, (user_id, limit))
        else:
            cursor.execute("""
                SELECT * FROM measurements
                ORDER BY date DESC, id DESC
                LIMIT ?
            """, (limit,))
        rows = cursor.fetchall()

    return [
        {
            "id": row["id"],
            "userId": row["user_id"],
            "date": row["date"],
            "height": row["height"],
            "weight": row["weight"],
            "shoulder": row["shoulder"],
            "bust": row["bust"],
            "waist": row["waist"],
            "hip": row["hip"],
            "bodyShape": row["body_shape"],
            "confidence": row["confidence"],
            "bmi": row["bmi"],
            "waistHipRatio": row["waist_hip_ratio"],
            "shoulderHipRatio": row["shoulder_hip_ratio"],
            "notes": row["notes"],
            "createdAt": row["created_at"],
        }
        for row in rows
    ]

def get_measurement_by_id(measurement_id: int, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve a single measurement by ID."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM measurements WHERE id = ?", (measurement_id,))
        row = cursor.fetchone()

    if not row:
        return None

    return {
        "id": row["id"],
        "userId": row["user_id"],
        "date": row["date"],
        "height": row["height"],
        "weight": row["weight"],
        "shoulder": row["shoulder"],
        "bust": row["bust"],
        "waist": row["waist"],
        "hip": row["hip"],
        "bodyShape": row["body_shape"],
        "confidence": row["confidence"],
        "bmi": row["bmi"],
        "waistHipRatio": row["waist_hip_ratio"],
        "shoulderHipRatio": row["shoulder_hip_ratio"],
        "notes": row["notes"],
        "createdAt": row["created_at"],
    }

def delete_measurement(measurement_id: int, db_path: Optional[str] = None) -> bool:
    """Delete a measurement record by ID. Returns True if deleted."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM measurements WHERE id = ?", (measurement_id,))
        conn.commit()
        return cursor.rowcount > 0

def get_progress_timeline(user_id: Optional[str] = None, db_path: Optional[str] = None) -> Dict[str, Any]:
    """Retrieve timeline measurements ordered chronologically for charting."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        if user_id:
            cursor.execute("""
                SELECT date, weight, waist, hip, bust, bmi, waist_hip_ratio, body_shape
                FROM measurements
                WHERE user_id = ?
                ORDER BY date ASC, id ASC
            """, (user_id,))
        else:
            cursor.execute("""
                SELECT date, weight, waist, hip, bust, bmi, waist_hip_ratio, body_shape
                FROM measurements
                ORDER BY date ASC, id ASC
            """)
        rows = cursor.fetchall()

    timeline = [
        {
            "date": row["date"],
            "weight": row["weight"],
            "waist": row["waist"],
            "hip": row["hip"],
            "bust": row["bust"],
            "bmi": row["bmi"],
            "waistHipRatio": row["waist_hip_ratio"],
            "bodyShape": row["body_shape"],
        }
        for row in rows
    ]

    return {
        "totalRecords": len(timeline),
        "timeline": timeline,
    }

def create_user(
    name: str,
    email: str,
    password_hash: str,
    age_range: str = "",
    gender: str = "",
    goal: str = "maintain",
    activity_level: str = "beginner",
    db_path: Optional[str] = None
) -> Dict[str, Any]:
    """Insert a new user account into SQLite."""
    user_id = str(uuid.uuid4())
    normalized_email = email.lower().strip()
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (id, name, email, password_hash, age_range, gender, goal, activity_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, name, normalized_email, password_hash, age_range, gender, goal, activity_level))
        conn.commit()

    return {
        "id": user_id,
        "name": name,
        "email": normalized_email,
        "ageRange": age_range,
        "gender": gender,
        "goal": goal,
        "activityLevel": activity_level,
    }

def get_user_by_email(email: str, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve user record by email including password hash for authentication."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
        row = cursor.fetchone()
    if not row:
        return None
    return dict(row)

def get_user_by_id(user_id: str, db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve sanitized user profile by user ID."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
    if not row:
        return None
    row_dict = dict(row)
    return {
        "id": row_dict["id"],
        "name": row_dict["name"],
        "email": row_dict["email"],
        "ageRange": row_dict.get("age_range", ""),
        "gender": row_dict.get("gender", ""),
        "goal": row_dict.get("goal", "maintain"),
        "activityLevel": row_dict.get("activity_level", "beginner"),
        "createdAt": row_dict.get("created_at", ""),
    }

def update_user_profile(user_id: str, updates: Dict[str, Any], db_path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Update profile fields for a user."""
    allowed = ["name", "age_range", "gender", "goal", "activity_level"]
    fields = []
    values = []
    for k, v in updates.items():
        snake_k = "age_range" if k == "ageRange" else ("activity_level" if k == "activityLevel" else k)
        if snake_k in allowed:
            fields.append(f"{snake_k} = ?")
            values.append(v)
    if not fields:
        return get_user_by_id(user_id, db_path)
    values.append(user_id)
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", tuple(values))
        conn.commit()
    return get_user_by_id(user_id, db_path)
