
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from app.extensions import db, migrate


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    # Initialize database and migrations
    db.init_app(app)
    migrate.init_app(app, db)

    # Enable CORS
    CORS(app, origins=app.config["CORS_ORIGINS"])

    # Health check endpoint
    @app.get("/api/health")
    def health_check():
        return jsonify({
            "success": True,
            "message": "CareerBridge API is running"
        }), 200

    # Import Campus Skill Exchange models and routes
    from app.skill_exchange import models
    from app.skill_exchange.routes import skill_exchange_bp

    # Register Campus Skill Exchange routes
    app.register_blueprint(skill_exchange_bp)

    # Create database tables if they do not already exist
    with app.app_context():
        db.create_all()

    return app
