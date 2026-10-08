"""
Main application factory and entry point for BodyCurve Analyzer Backend API.
"""

import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from backend.models.database import init_db
from backend.routes.analysis import analysis_bp
from backend.routes.recommendations import recommendations_bp
from backend.routes.measurements import measurements_bp
from backend.routes.auth import auth_bp

load_dotenv()

def create_app(test_config=None) -> Flask:
    app = Flask(__name__)
    
    # Configure CORS to allow requests from Next.js development and production origins
    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "*"]}},
        supports_credentials=True,
    )

    if test_config:
        app.config.update(test_config)

    # Initialize database tables
    init_db()

    # Register API Blueprints
    app.register_blueprint(analysis_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(measurements_bp)
    app.register_blueprint(auth_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "BodyCurve Analyzer Backend API",
            "version": "1.0.0"
        }), 200

    # Global Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"success": False, "error": "Bad Request", "details": str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": "Resource not found."}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"success": False, "error": "Internal Server Error", "details": str(e)}), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting BodyCurve Analyzer API server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
