import os
import sys
import pytest
from datetime import datetime, timezone, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db
from app.internship.models import Internship, Application, Bookmark
import jwt

@pytest.fixture
def app():
    """Create and configure a testing Flask application."""
    test_app = create_app("testing")
    
    with test_app.app_context():
        db.create_all()
        # Seed test internships
        now = datetime.now(timezone.utc)
        i1 = Internship(
            title="Frontend React Engineer",
            company_name="Alpha Tech",
            location="Bengaluru, Karnataka",
            work_mode="Remote",
            description="Build scalable web applications using React and Tailwind.",
            eligibility="Pre-final year B.Tech students.",
            responsibilities="Write clean modular components.",
            required_skills="React, JavaScript, CSS",
            stipend="₹30,000 / month",
            duration="3 Months",
            application_deadline=now + timedelta(days=20),
            is_paid=True
        )
        i2 = Internship(
            title="Python Backend Developer",
            company_name="Beta Systems",
            location="Hyderabad, Telangana",
            work_mode="Hybrid",
            description="Work on Flask REST APIs and MySQL microservices.",
            eligibility="Students with Python & SQL knowledge.",
            responsibilities="Develop API endpoints and unit tests.",
            required_skills="Python, Flask, MySQL, Docker",
            stipend="₹35,000 / month",
            duration="6 Months",
            application_deadline=now + timedelta(days=15),
            is_paid=True
        )
        i3 = Internship(
            title="Open Source Documentation Intern",
            company_name="Gamma Labs",
            location="Remote",
            work_mode="Remote",
            description="Contribute to developer documentation and tutorials.",
            eligibility="All passionate students.",
            responsibilities="Write and review technical guides.",
            required_skills="Markdown, Git, Technical Writing",
            stipend="Unpaid",
            duration="2 Months",
            application_deadline=now + timedelta(days=10),
            is_paid=False
        )
        db.session.add_all([i1, i2, i3])
        db.session.commit()
        
        yield test_app
        
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for the app."""
    return test_app_client(app)

def test_app_client(app):
    return app.test_client()

@pytest.fixture
def student1_headers():
    """Headers representing Student ID 1."""
    return {
        "X-Student-Id": "1",
        "X-User-Role": "student",
        "X-User-Name": "Alex Johnson"
    }

@pytest.fixture
def student2_headers():
    """Headers representing Student ID 2."""
    return {
        "X-Student-Id": "2",
        "X-User-Role": "student",
        "X-User-Name": "Priya Sharma"
    }

@pytest.fixture
def admin_headers():
    """Headers representing Staff / Admin."""
    return {
        "X-Student-Id": "99",
        "X-User-Role": "admin",
        "X-User-Name": "Placement Coordinator"
    }

@pytest.fixture
def jwt_student_headers(app):
    """JWT Bearer token representing Student ID 10."""
    token = jwt.encode(
        {"sub": "10", "role": "student", "name": "Rahul Verma", "email": "rahul@careerbridge.edu"},
        app.config["JWT_SECRET_KEY"],
        algorithm=app.config["JWT_ALGORITHM"]
    )
    return {
        "Authorization": f"Bearer {token}"
    }

@pytest.fixture
def jwt_admin_headers(app):
    """JWT Bearer token representing Admin."""
    token = jwt.encode(
        {"sub": "999", "role": "admin", "name": "Dean Placement", "email": "admin@careerbridge.edu"},
        app.config["JWT_SECRET_KEY"],
        algorithm=app.config["JWT_ALGORITHM"]
    )
    return {
        "Authorization": f"Bearer {token}"
    }
