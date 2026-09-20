"""
SQLite database access and persistence layer for BodyCurve Analyzer.
Lightweight, thread-safe, and zero-daemon overhead.
"""

import os
import sqlite3
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "bodycurve.db")

def get_db_connection(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path: str = DB_PATH):
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

        # Users table (for optional profile/user tracking)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                goal TEXT DEFAULT 'maintain',
                activity_level TEXT DEFAULT 'beginner',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()

def save_measurement(data: Dict[str, Any], db_path: str = DB_PATH) -> Dict[str, Any]:
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

def get_measurements(user_id: str = "guest", limit: int = 100, db_path: str = DB_PATH) -> List[Dict[str, Any]]:
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

def get_measurement_by_id(measurement_id: int, db_path: str = DB_PATH) -> Optional[Dict[str, Any]]:
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

def delete_measurement(measurement_id: int, db_path: str = DB_PATH) -> bool:
    """Delete a measurement record by ID. Returns True if deleted."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM measurements WHERE id = ?", (measurement_id,))
        conn.commit()
        return cursor.rowcount > 0

def get_progress_timeline(user_id: str = "guest", db_path: str = DB_PATH) -> Dict[str, Any]:
    """Retrieve timeline measurements ordered chronologically for charting."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT date, weight, waist, hip, bust, bmi, waist_hip_ratio, body_shape
            FROM measurements
            WHERE user_id = ?
            ORDER BY date ASC, id ASC
        """, (user_id,))
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
