"""
CareerBridge - Common Routes Blueprint
Health-check, API documentation, and shared utility endpoints.
"""

from flask import Blueprint, redirect, url_for
from app.common.utils import success_response, error_response

common_bp = Blueprint('common', __name__)


@common_bp.route('', methods=['GET'])
@common_bp.route('/', methods=['GET'])
def index():
    """Root API endpoint returning platform overview."""
    return success_response(
        data={"service": "CareerBridge API", "version": "1.0.0"},
        message="CareerBridge Multidisciplinary Career Platform API active"
    )


@common_bp.route('/health', methods=['GET'])
def health_check():
    """Simple health-check endpoint to verify the API is running."""
    return success_response(
        data={"status": "healthy", "service": "CareerBridge API"},
        message="CareerBridge API is running smoothly"
    )


@common_bp.route('/api-info', methods=['GET'])
def api_info():
    """Return API version, architecture overview, and endpoint catalogue."""
    data = {
        "version": "1.0.0",
        "name": "CareerBridge API",
        "description": "Campus Career Development Platform Backend",
        "team_modules": {
            "Member 1": "Core Platform & Auth (/api/auth, /api)",
            "Member 2": "Internship & Application Management (/api/internship)",
            "Member 3": "Placement Preparation (/api/placement)",
            "Member 4": "Skill Gap Analyzer (/api/skill-gap)",
            "Member 5": "Campus Skill Exchange (/api/skill-exchange)",
        },
        "endpoints": [
            {
                "group": "Authentication & Profile (Member 1)",
                "prefix": "/api/auth",
                "routes": [
                    "POST /register -> {name, email, password, role?} -> {token, user}",
                    "POST /login -> {email, password} -> {token, user}",
                    "GET  /profile -> (Auth Bearer) -> {user}",
                    "PUT  /profile -> (Auth Bearer) -> {user}",
                    "GET  /students -> list of students",
                    "GET  /dashboard-stats -> (Auth Bearer) -> aggregate counts"
                ]
            },
            {
                "group": "Common System (Member 1)",
                "prefix": "/api",
                "routes": [
                    "GET /health -> service status",
                    "GET /api-info -> this endpoint registry"
                ]
            },
            {
                "group": "Internships (Member 2)",
                "prefix": "/api/internship",
                "routes": [
                    "GET  / -> list internships",
                    "GET  /<id> -> internship details",
                    "POST /<id>/apply -> apply for internship",
                    "GET  /applications/me -> my applications",
                    "POST /<id>/bookmark -> bookmark internship",
                    "GET  /bookmarks/me -> my bookmarked internships"
                ]
            },
            {
                "group": "Placement Preparation (Member 3)",
                "prefix": "/api/placement",
                "routes": [
                    "GET  /categories -> DSA/aptitude categories",
                    "GET  /questions?category_id=X -> category questions",
                    "GET  /mock-tests -> available mock tests",
                    "POST /mock-tests/<id>/submit -> submit test score",
                    "GET  /results/me -> my test history"
                ]
            },
            {
                "group": "Skill Gap Analyzer (Member 4)",
                "prefix": "/api/skill-gap",
                "routes": [
                    "GET  /roles -> target job roles",
                    "GET  /skills/me -> user existing skills",
                    "POST /skills -> add existing skill",
                    "POST /analyze -> analyze gap for target role",
                    "GET  /resources?skill=X -> learning resources"
                ]
            },
            {
                "group": "Campus Skill Exchange (Member 5)",
                "prefix": "/api/skill-exchange",
                "routes": [
                    "GET  /listings -> explore skill offers & requests",
                    "POST /listings -> offer or request a skill",
                    "POST /listings/<id>/request -> send learning request",
                    "GET  /requests/me -> my exchange requests",
                    "POST /reviews -> submit review and rating"
                ]
            }
        ]
    }
    return success_response(data=data, message="API information retrieved")
