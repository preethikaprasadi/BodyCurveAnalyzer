"""
Production WSGI entrypoint for BodyCurve Analyzer Backend.
Used by Gunicorn, uWSGI, Waitress, and container runtimes.
"""

from backend.app import app

if __name__ == "__main__":
    app.run()
