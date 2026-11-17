import os
from flask import Flask, jsonify
from flask_cors import CORS
from app.extensions import db
from app.config import config_by_name

def create_app(config_name=None):
    """
    Application factory for CareerBridge Backend.
    """
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Register Member 2 Internship & Application Management Blueprint
    from app.internship.routes import internship_bp
    app.register_blueprint(internship_bp)

    # Health check and module metadata endpoint
    @app.route("/", methods=["GET"])
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "module": "CareerBridge - Internship & Application Management (Member 2)",
            "version": "1.0.0",
            "endpoints": [
                "/api/internships",
                "/api/internships/<id>",
                "/api/applications",
                "/api/applications/my",
                "/api/applications/<id>",
                "/api/applications/<id>/status",
                "/api/internships/<id>/bookmark",
                "/api/bookmarks",
                "/api/internships/stats",
                "/api/internships/seed"
            ]
        }), 200

    # Auto-initialize database tables and seed if empty in dev mode
    with app.app_context():
        db.create_all()
        # Seed initial rich data if empty
        if not app.config.get("TESTING", False):
            from app.internship.models import Internship
            if Internship.query.count() == 0:
                from app.internship.services import seed_sample_internships
                seed_sample_internships()

    return app

