"""
Unit and integration tests for authentication, JWT validation, and user profiles.
"""

import pytest
from backend.app import create_app

@pytest.fixture
def client(tmp_path):
    """Create test client with an isolated temporary SQLite database."""
    import backend.models.database as db_mod

    test_db = str(tmp_path / "test_bodycurve.db")
    original_db_path = db_mod.DB_PATH

    db_mod.DB_PATH = test_db

    try:
        app = create_app({"TESTING": True})

        with app.test_client() as client:
            yield client
    finally:
        db_mod.DB_PATH = original_db_path

def test_register_success(client):
    """Verify new user registration generates JWT token and sanitized profile."""
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "securepassword123",
        "goal": "muscle_gain",
        "activityLevel": "intermediate",
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["email"] == "jane@example.com"
    assert data["user"]["name"] == "Jane Doe"
    assert "password_hash" not in data["user"]

def test_register_duplicate_email(client):
    """Verify duplicate email registration is rejected with 409 Conflict."""
    payload = {
        "name": "Jane Doe",
        "email": "duplicate@example.com",
        "password": "password123",
    }
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.get_json()["error"]

def test_register_validation_errors(client):
    """Verify validation rejects short passwords or malformed emails."""
    res = client.post("/api/auth/register", json={
        "name": "J",
        "email": "not-an-email",
        "password": "123",
    })
    assert res.status_code == 400
    details = res.get_json().get("details", [])
    assert len(details) >= 3

def test_login_flow(client):
    """Verify login with valid and invalid credentials."""
    # Register first
    client.post("/api/auth/register", json={
        "name": "John Smith",
        "email": "john@example.com",
        "password": "mysecretpassword",
    })

    # Successful login
    login_res = client.post("/api/auth/login", json={
        "email": "john@example.com",
        "password": "mysecretpassword",
    })
    assert login_res.status_code == 200
    login_data = login_res.get_json()
    assert login_data["success"] is True
    assert "token" in login_data
    token = login_data["token"]

    # Failed login - wrong password
    bad_res = client.post("/api/auth/login", json={
        "email": "john@example.com",
        "password": "wrongpassword",
    })
    assert bad_res.status_code == 401

    # Protected me endpoint with token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.get_json()["user"]["email"] == "john@example.com"

    # Protected me endpoint with missing/invalid token
    no_auth_res = client.get("/api/auth/me")
    assert no_auth_res.status_code == 401

    fake_auth_res = client.get("/api/auth/me", headers={"Authorization": "Bearer fake.invalid.token"})
    assert fake_auth_res.status_code == 401

def test_update_profile(client):
    """Verify authenticated user can update goal and activity level."""
    reg = client.post("/api/auth/register", json={
        "name": "Alex",
        "email": "alex@example.com",
        "password": "mypassword123",
        "goal": "maintain",
    }).get_json()
    token = reg["token"]

    update_res = client.put(
        "/api/auth/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Alexander", "goal": "fat_loss", "activityLevel": "advanced"}
    )
    assert update_res.status_code == 200
    updated_user = update_res.get_json()["user"]
    assert updated_user["name"] == "Alexander"
    assert updated_user["goal"] == "fat_loss"
    assert updated_user["activityLevel"] == "advanced"
