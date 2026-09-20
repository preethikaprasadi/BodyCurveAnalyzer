"""
Automated tests for BodyCurve Analyzer Flask REST API.
Covers validation, ML prediction endpoint, recommendations, and persistence CRUD.
"""

import pytest
import json
from backend.app import create_app

@pytest.fixture
def client(tmp_path):
    """Create test client with temporary SQLite database."""
    test_db = str(tmp_path / "test_bodycurve.db")
    app = create_app({"TESTING": True})
    
    # Override database path in module for isolated tests
    import backend.models.database as db_mod
    original_db_path = db_mod.DB_PATH
    db_mod.DB_PATH = test_db
    db_mod.init_db(test_db)

    with app.test_client() as client:
        yield client

    db_mod.DB_PATH = original_db_path

def test_health_endpoint(client):
    """Verify health check endpoint returns 200 OK."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"

def test_analyze_valid_measurements(client):
    """Verify POST /api/analyze succeeds with valid measurement input."""
    payload = {
        "height": 165.0,
        "weight": 60.0,
        "shoulder": 36.0,
        "bust": 92.0,
        "waist": 65.0,
        "hip": 94.0,
        "goal": "muscle_gain",
        "activityLevel": "intermediate",
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    
    # Check analysis structure
    analysis = data["analysis"]
    assert "bodyShape" in analysis
    assert analysis["bodyShape"] in ["hourglass", "rectangle", "pear", "inverted_triangle", "apple"]
    assert "confidence" in analysis
    assert 0.0 <= analysis["confidence"] <= 1.0
    
    # Check proportions
    proportions = analysis["proportions"]
    assert "bmi" in proportions
    assert "waistHipRatio" in proportions
    assert "shoulderHipRatio" in proportions
    
    # Check recommendations
    recommendations = data["recommendations"]
    assert "fitness" in recommendations
    assert "wellness" in recommendations
    assert "fashion" in recommendations

def test_analyze_missing_field(client):
    """Verify POST /api/analyze fails with 400 when a required field is missing."""
    payload = {
        "height": 165.0,
        "weight": 60.0,
        # waist is missing!
        "shoulder": 36.0,
        "bust": 92.0,
        "hip": 94.0,
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert data["success"] is False
    assert any("waist" in err.lower() for err in data.get("details", []))

def test_analyze_out_of_bounds_measurement(client):
    """Verify POST /api/analyze rejects impossible body measurements."""
    payload = {
        "height": 450.0,  # Impossible human height
        "weight": 60.0,
        "shoulder": 36.0,
        "bust": 92.0,
        "waist": 65.0,
        "hip": 94.0,
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert data["success"] is False
    assert any("height" in err.lower() for err in data.get("details", []))

def test_analyze_non_numeric_input(client):
    """Verify POST /api/analyze rejects strings that cannot be converted to float."""
    payload = {
        "height": "tall",
        "weight": 60.0,
        "shoulder": 36.0,
        "bust": 92.0,
        "waist": 65.0,
        "hip": 94.0,
    }
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert data["success"] is False

def test_get_recommendations_endpoint(client):
    """Verify GET /api/recommendations retrieves shape and goal specific guidance."""
    res = client.get("/api/recommendations?bodyShape=hourglass&goal=maintain")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    rec = data["data"]
    assert rec["bodyShape"] == "hourglass"
    assert "fitness" in rec
    assert "wellness" in rec
    assert "fashion" in rec

def test_measurement_crud_and_progress(client):
    """Verify creating, listing, progress timeline, and deleting measurements."""
    sample = {
        "height": 170.0,
        "weight": 65.0,
        "shoulder": 38.0,
        "bust": 90.0,
        "waist": 70.0,
        "hip": 95.0,
        "bodyShape": "hourglass",
        "confidence": 0.95,
        "userId": "test-user-1",
        "date": "2026-09-01",
        "notes": "Baseline measurement",
    }
    
    # 1. Create measurement
    create_res = client.post("/api/measurements", json=sample)
    assert create_res.status_code == 201
    created_id = create_res.get_json()["data"]["id"]
    
    # 2. List measurements
    list_res = client.get("/api/measurements?userId=test-user-1")
    assert list_res.status_code == 200
    list_data = list_res.get_json()
    assert list_data["count"] >= 1
    
    # 3. Check progress timeline
    prog_res = client.get("/api/progress?userId=test-user-1")
    assert prog_res.status_code == 200
    prog_data = prog_res.get_json()["data"]
    assert prog_data["totalRecords"] >= 1
    assert prog_data["timeline"][0]["weight"] == 65.0
    
    # 4. Delete measurement
    del_res = client.delete(f"/api/measurements/{created_id}")
    assert del_res.status_code == 200
    
    # 5. Verify deleted
    get_res = client.get(f"/api/measurements/{created_id}")
    assert get_res.status_code == 404
