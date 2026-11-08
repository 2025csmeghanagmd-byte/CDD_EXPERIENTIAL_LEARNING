from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from app.extensions import db, migrate

def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config["CORS_ORIGINS"])

    @app.get("/api/health")
    def health_check():
        return jsonify({
            "success": True,
            "message": "CareerBridge API is running"
        }), 200

    # Register module Blueprints here as modules are implemented.
    # Keep Blueprint registration coordinated to avoid shared-file conflicts.

    return app
