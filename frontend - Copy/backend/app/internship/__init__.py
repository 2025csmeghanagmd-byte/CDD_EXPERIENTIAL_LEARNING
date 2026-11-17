from flask import Blueprint

internship_bp = Blueprint("internships", __name__, url_prefix="/api")

# Import routes at the bottom to avoid circular dependencies
from app.internship import routes  # noqa: E402, F401

