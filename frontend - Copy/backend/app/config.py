import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Config:
    """Base application configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "careerbridge-internship-module-secret-key-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "careerbridge-shared-jwt-secret-key-2026")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    
    # Database configuration: defaults to SQLite for instant local zero-config setup,
    # and seamlessly uses MySQL when DATABASE_URL (e.g. mysql+pymysql://root:password@localhost:3306/careerbridge) is provided.
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'careerbridge_internships.db'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    } if "mysql" in os.getenv("DATABASE_URL", "").lower() else {}

    # Standalone Demo student identification (used if no JWT token is supplied)
    DEFAULT_STUDENT_ID = int(os.getenv("DEFAULT_STUDENT_ID", "1"))
    DEFAULT_STUDENT_NAME = os.getenv("DEFAULT_STUDENT_NAME", "Alex Johnson")
    DEFAULT_STUDENT_EMAIL = os.getenv("DEFAULT_STUDENT_EMAIL", "alex.johnson@campus.edu")

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    DEBUG = False
    TESTING = True
    # In-memory SQLite for blazing fast isolated tests
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}

