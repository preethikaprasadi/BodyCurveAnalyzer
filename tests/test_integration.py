"""
End-to-End Integration and Edge-Case Test Suite for BodyCurve Analyzer.
Tests all 5 silhouette archetypes, SQLite injection safety, boundary values,
and end-to-end flow from inference to persistence and progress tracking.
"""

import pytest
from backend.app import create_app

@pytest.fixture
def client(tmp_path):
    test_db = str(tmp_path / "integration_bodycurve.db")
    app = create_app({"TESTING": True})
    
    import backend.models.database as db_mod
    original_db_path = db_mod.DB_PATH
    db_mod.DB_PATH = test_db
    db_mod.init_db(test_db)

    with app.test_client() as client:
        yield client

    db_mod.DB_PATH = original_db_path

def test_all_five_body_shape_archetypes(client):
    """
    Verify that archetypal measurement sets classify into their expected shapes
    with valid proportions and comprehensive recommendations.
    """
    archetypes = [
        {
            "expected_shape": "hourglass",
            "measurements": {"height": 165.0, "weight": 60.0, "shoulder": 36.0, "bust": 92.0, "waist": 64.0, "hip": 94.0}
        },
        {
            "expected_shape": "rectangle",
            "measurements": {"height": 168.0, "weight": 62.0, "shoulder": 37.0, "bust": 89.0, "waist": 76.0, "hip": 90.0}
        },
        {
            "expected_shape": "pear",
            "measurements": {"height": 162.0, "weight": 65.0, "shoulder": 34.0, "bust": 84.0, "waist": 72.0, "hip": 102.0}
        },
        {
            "expected_shape": "inverted_triangle",
            "measurements": {"height": 172.0, "weight": 64.0, "shoulder": 44.0, "bust": 98.0, "waist": 70.0, "hip": 88.0}
        },
        {
            "expected_shape": "apple",
            "measurements": {"height": 164.0, "weight": 74.0, "shoulder": 37.0, "bust": 98.0, "waist": 96.0, "hip": 94.0}
        },
    ]

    for item in archetypes:
        payload = {
            **item["measurements"],
            "goal": "maintain",
            "activityLevel": "intermediate",
            "saveRecord": True,
            "userId": "integration_tester",
            "notes": f"Testing {item['expected_shape']} archetype",
        }

        res = client.post("/api/analyze", json=payload)
        assert res.status_code == 200, f"Failed for {item['expected_shape']}: {res.data}"
        data = res.get_json()

        analysis = data["analysis"]
        assert analysis["bodyShape"] == item["expected_shape"], (
            f"Expected {item['expected_shape']}, got {analysis['bodyShape']}"
        )
        assert analysis["confidence"] >= 0.50

        # Proportions check
        proportions = analysis["proportions"]
        assert proportions["bmi"] > 0
        assert proportions["waistHipRatio"] > 0
        assert proportions["shoulderHipRatio"] > 0

        # Recommendations check
        recs = data["recommendations"]
        assert len(recs["fitness"]["exercises"]) > 0
        assert len(recs["wellness"]["nutritionTips"]) > 0
        assert len(recs["fashion"]["tops"]) > 0

        # Verify auto-save occurred
        assert data["savedRecord"] is not None
        assert data["savedRecord"]["bodyShape"] == item["expected_shape"]

    # Verify all 5 were persisted and returned by progress endpoint
    prog_res = client.get("/api/progress?userId=integration_tester")
    assert prog_res.status_code == 200
    prog_data = prog_res.get_json()["data"]
    assert prog_data["totalRecords"] == 5

def test_extreme_boundary_limits(client):
    """Verify input validation handles absolute physiological bounds."""
    # Test valid boundary minima
    min_payload = {
        "height": 100.0,
        "weight": 25.0,
        "shoulder": 20.0,
        "bust": 40.0,
        "waist": 30.0,
        "hip": 40.0,
    }
    res_min = client.post("/api/analyze", json=min_payload)
    assert res_min.status_code == 200

    # Test valid boundary maxima
    max_payload = {
        "height": 250.0,
        "weight": 300.0,
        "shoulder": 80.0,
        "bust": 200.0,
        "waist": 200.0,
        "hip": 220.0,
    }
    res_max = client.post("/api/analyze", json=max_payload)
    assert res_max.status_code == 200

    # Test just below minimum
    below_min_payload = {**min_payload, "height": 99.9}
    res_below = client.post("/api/analyze", json=below_min_payload)
    assert res_below.status_code == 400

    # Test just above maximum
    above_max_payload = {**max_payload, "weight": 300.1}
    res_above = client.post("/api/analyze", json=above_max_payload)
    assert res_above.status_code == 400

def test_sql_injection_resilience(client):
    """Verify parameterized SQLite queries safely handle SQL injection payloads."""
    injection_payload = {
        "height": 165.0,
        "weight": 60.0,
        "shoulder": 36.0,
        "bust": 90.0,
        "waist": 68.0,
        "hip": 94.0,
        "userId": "'; DROP TABLE measurements; --",
        "notes": "' OR '1'='1",
        "saveRecord": True,
    }

    res = client.post("/api/analyze", json=injection_payload)
    assert res.status_code == 200

    # Ensure measurements table still exists and functions normally
    list_res = client.get("/api/measurements?limit=10")
    assert list_res.status_code == 200
    assert list_res.get_json()["count"] >= 1
