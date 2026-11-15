"""
CareerBridge - Flask Application Factory
Campus Career Platform Backend
"""

import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# JWT manager instance (module-level so other modules can access if needed)
jwt = JWTManager()


def get_db():
    """
    Create and return a database connection with DictCursor.
    Attempts PyMySQL first; if MySQL is unavailable, automatically falls back
    to an SQLite database adapter so the platform runs seamlessly.
    """
    from app.db import get_db_connection
    return get_db_connection()


def create_app():
    """
    Application factory — creates and configures the Flask app,
    initialises extensions, and registers all blueprints.
    """
    app = Flask(__name__)

    # ── Configuration ────────────────────────────────────────────────
    from app.config import Config
    app.config.from_object(Config)

    # ── Extensions ───────────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": "*"}})  # allow all origins for dev
    jwt.init_app(app)

    # ── Blueprints ───────────────────────────────────────────────────
    from app.auth.routes import auth_bp
    from app.common.routes import common_bp
    from app.internship.routes import internship_bp
    from app.placement.routes import placement_bp
    from app.skill_gap.routes import skill_gap_bp
    from app.skill_exchange.routes import skill_exchange_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(common_bp, url_prefix='/api')
    app.register_blueprint(internship_bp, url_prefix='/api/internship')
    app.register_blueprint(placement_bp, url_prefix='/api/placement')
    app.register_blueprint(skill_gap_bp, url_prefix='/api/skill-gap')
    app.register_blueprint(skill_exchange_bp, url_prefix='/api/skill-exchange')

    return app
