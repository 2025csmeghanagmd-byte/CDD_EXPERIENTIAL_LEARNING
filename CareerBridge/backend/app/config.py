"""
CareerBridge - Application Configuration
"""

import os
from datetime import timedelta


class Config:
    """Base configuration class for the CareerBridge application."""

    # Flask secret key
    SECRET_KEY = os.environ.get('SECRET_KEY', 'careerbridge-flask-secret-key-32chars-long')

    # JWT configuration (32+ bytes key to satisfy RFC 7518)
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'careerbridge-super-secure-jwt-secret-key-2024')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # MySQL database configuration (supports both MYSQL_* and DB_* env vars)
    MYSQL_HOST = os.environ.get('MYSQL_HOST') or os.environ.get('DB_HOST', 'localhost')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT') or os.environ.get('DB_PORT', 3306))
    MYSQL_USER = os.environ.get('MYSQL_USER') or os.environ.get('DB_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD') or os.environ.get('DB_PASSWORD', '')
    MYSQL_DB = os.environ.get('MYSQL_DB') or os.environ.get('DB_NAME', 'careerbridge')
