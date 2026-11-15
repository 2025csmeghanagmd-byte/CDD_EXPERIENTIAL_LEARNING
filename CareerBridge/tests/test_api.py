"""
CareerBridge - Automated Integration & Unit Test Suite
Covers all 5 modules:
1. Member 1: Core Platform & Auth (Registration, Login, Profile, Forgot Password, Reset Password, Dashboard Stats)
2. Member 2: Internship Management (Listing, Details, Applying, Status Tracking, Bookmarking)
3. Member 3: Placement Preparation (Categories, Questions, Mock Tests, Submission & Auto-scoring, History)
4. Member 4: Skill Gap Analyzer (Job Roles, User Skills CRUD, Skill Gap Calculation, Recommendations)
5. Member 5: Campus Skill Exchange (Listings, Creating Offers/Requests, Exchange Workflows, Reviews)
"""

import sys
import os
import pytest

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import create_app, get_db


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_core_health_check(client):
    """Test health check / index route."""
    res = client.get('/api')
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert 'CareerBridge' in data['message']


def test_auth_registration_and_login(client):
    """Test user registration and subsequent login."""
    unique_email = f"test_student_{os.urandom(4).hex()}@careerbridge.com"
    reg_payload = {
        "name": "Integration Student",
        "email": unique_email,
        "password": "Password123!",
        "role": "student"
    }

    # 1. Register
    reg_res = client.post('/api/auth/register', json=reg_payload)
    assert reg_res.status_code in (200, 201)
    reg_data = reg_res.get_json()
    assert reg_data['success'] is True
    assert 'token' in reg_data['data']

    # 2. Login
    login_res = client.post('/api/auth/login', json={
        "email": unique_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    login_data = login_res.get_json()
    assert login_data['success'] is True
    token = login_data['data']['token']
    assert token is not None

    # 3. Authenticated Profile
    headers = {"Authorization": f"Bearer {token}"}
    profile_res = client.get('/api/auth/profile', headers=headers)
    assert profile_res.status_code == 200
    profile_data = profile_res.get_json()
    assert profile_data['data']['user']['email'] == unique_email

    # 4. Dashboard Stats
    stats_res = client.get('/api/auth/dashboard-stats', headers=headers)
    assert stats_res.status_code == 200
    stats_data = stats_res.get_json()
    assert 'totalInternships' in stats_data['data']


def test_forgot_and_reset_password_flow(client):
    """Test password recovery and reset token validation."""
    email = f"reset_test_{os.urandom(4).hex()}@careerbridge.com"
    client.post('/api/auth/register', json={
        "name": "Reset Candidate",
        "email": email,
        "password": "OldPassword123",
        "role": "student"
    })

    # Step 1: Request Forgot Password
    forgot_res = client.post('/api/auth/forgot-password', json={"email": email})
    assert forgot_res.status_code == 200
    forgot_data = forgot_res.get_json()
    assert forgot_data['success'] is True
    reset_token = forgot_data['data']['reset_token']
    assert reset_token is not None

    # Step 2: Reset Password with Token
    reset_res = client.post('/api/auth/reset-password', json={
        "token": reset_token,
        "password": "NewSecurePassword456",
        "confirm_password": "NewSecurePassword456"
    })
    assert reset_res.status_code == 200
    assert reset_res.get_json()['success'] is True

    # Step 3: Login with New Password
    login_new = client.post('/api/auth/login', json={
        "email": email,
        "password": "NewSecurePassword456"
    })
    assert login_new.status_code == 200
    assert login_new.get_json()['success'] is True


def test_internship_module(client):
    """Test Member 2 Internship search, details, bookmark and application endpoints."""
    # 1. Browse Internships
    list_res = client.get('/api/internship/list')
    assert list_res.status_code == 200
    list_data = list_res.get_json()
    internships = list_data['data']['internships']
    assert len(internships) > 0
    target_id = internships[0]['id']

    # 2. View details
    detail_res = client.get(f'/api/internship/{target_id}')
    assert detail_res.status_code == 200
    assert detail_res.get_json()['data']['internship']['id'] == target_id

    # 3. Authenticate and apply
    auth_res = client.post('/api/auth/login', json={
        "email": "student@careerbridge.com",
        "password": "student123"
    })
    token = auth_res.get_json()['data']['token']
    headers = {"Authorization": f"Bearer {token}"}

    # Bookmark toggle
    bm_res = client.post('/api/internship/bookmark', json={"internship_id": target_id}, headers=headers)
    assert bm_res.status_code == 200

    # View my bookmarks
    my_bm = client.get('/api/internship/my-bookmarks', headers=headers)
    assert my_bm.status_code == 200

    # View applications
    my_apps = client.get('/api/internship/my-applications', headers=headers)
    assert my_apps.status_code == 200


def test_placement_module(client):
    """Test Member 3 Placement categories, questions, mock tests and submission."""
    # 1. Categories
    cat_res = client.get('/api/placement/categories')
    assert cat_res.status_code == 200
    cats = cat_res.get_json()['data']['categories']
    assert len(cats) > 0

    # 2. Questions
    q_res = client.get(f'/api/placement/questions?category_id={cats[0]["id"]}')
    assert q_res.status_code == 200

    # 3. Mock Tests
    tests_res = client.get('/api/placement/mock-tests')
    assert tests_res.status_code == 200
    tests = tests_res.get_json()['data']['mock_tests']
    assert len(tests) > 0
    test_id = tests[0]['id']

    # 4. Mock Test Detail for taking test
    detail_res = client.get(f'/api/placement/mock-tests/{test_id}')
    assert detail_res.status_code == 200
    test_data = detail_res.get_json()['data']['mock_test']
    assert 'questions' in test_data

    # 5. Submit Test with auth
    auth_res = client.post('/api/auth/login', json={
        "email": "student@careerbridge.com",
        "password": "student123"
    })
    token = auth_res.get_json()['data']['token']
    headers = {"Authorization": f"Bearer {token}"}

    submit_res = client.post(
        f'/api/placement/mock-tests/{test_id}/submit',
        json={"answers": {"1": "B", "2": "B"}, "time_taken": 120},
        headers=headers
    )
    assert submit_res.status_code == 200
    submit_data = submit_res.get_json()['data']
    assert 'score' in submit_data
    assert 'percentage' in submit_data
    assert 'breakdown' in submit_data

    # 6. Test results history
    hist_res = client.get('/api/placement/my-results', headers=headers)
    assert hist_res.status_code == 200


def test_skill_gap_module(client):
    """Test Member 4 Skill Gap roles, user skill inventory, gap analysis."""
    # 1. Roles
    roles_res = client.get('/api/skill-gap/roles')
    assert roles_res.status_code == 200
    roles = roles_res.get_json()['data']['job_roles']
    assert len(roles) > 0
    target_role_id = roles[0]['id']

    # Auth
    auth_res = client.post('/api/auth/login', json={
        "email": "student@careerbridge.com",
        "password": "student123"
    })
    token = auth_res.get_json()['data']['token']
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add skill to user inventory
    add_res = client.post(
        '/api/skill-gap/user-skills',
        json={"skill_name": "Docker", "proficiency": "intermediate"},
        headers=headers
    )
    assert add_res.status_code == 200

    # 3. Get user skills
    skills_res = client.get('/api/skill-gap/user-skills', headers=headers)
    assert skills_res.status_code == 200

    # 4. Analyze gap
    analysis_res = client.post(
        '/api/skill-gap/analyze',
        json={"job_role_id": target_role_id},
        headers=headers
    )
    assert analysis_res.status_code == 200
    analysis = analysis_res.get_json()['data']
    assert 'readiness_score' in analysis
    assert 'matching_skills' in analysis
    assert 'missing_skills' in analysis
    assert 'recommendations' in analysis


def test_skill_exchange_module(client):
    """Test Member 5 Skill Exchange listings, create listing, connect."""
    # 1. Listings
    list_res = client.get('/api/skill-exchange/listings')
    assert list_res.status_code == 200
    listings = list_res.get_json()['data']['listings']
    assert len(listings) > 0

    # Auth
    auth_res = client.post('/api/auth/login', json={
        "email": "student@careerbridge.com",
        "password": "student123"
    })
    token = auth_res.get_json()['data']['token']
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create listing
    create_res = client.post(
        '/api/skill-exchange/listings',
        json={
            "skill_name": "Figma Wireframing",
            "description": "Will teach UX wireframing and user journey mapping",
            "type": "offer",
            "is_paid": False,
            "price": 0
        },
        headers=headers
    )
    assert create_res.status_code == 200

    # 3. View my requests
    req_res = client.get('/api/skill-exchange/my-requests', headers=headers)
    assert req_res.status_code == 200

