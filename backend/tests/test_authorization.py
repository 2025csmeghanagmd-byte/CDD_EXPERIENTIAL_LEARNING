import pytest

def test_student_cannot_update_application_status(client, student1_headers):
    """
    Test security rule: A normal student must NEVER be able to change their own
    or any application status. Must return 403 Forbidden.
    """
    # Student 1 applies
    res_app = client.post(
        "/api/applications",
        json={"internship_id": 1, "resume_url": "https://resume.com/s1"},
        headers=student1_headers
    )
    app_id = res_app.get_json()["data"]["id"]

    # Student 1 attempts to change status to 'Selected'
    res_hack = client.patch(
        f"/api/applications/{app_id}/status",
        json={"status": "Selected"},
        headers=student1_headers
    )
    assert res_hack.status_code == 403
    data = res_hack.get_json()
    assert data["success"] is False
    assert "forbidden" in data["message"].lower() or "requires" in data["message"].lower()


def test_admin_can_update_application_status(client, student1_headers, admin_headers):
    """Test authorized admin/staff can update application status through valid lifecycle."""
    res_app = client.post(
        "/api/applications",
        json={"internship_id": 1, "resume_url": "https://resume.com/s1"},
        headers=student1_headers
    )
    app_id = res_app.get_json()["data"]["id"]

    # 1. Update to 'Under Review'
    res_review = client.patch(
        f"/api/applications/{app_id}/status",
        json={"status": "Under Review"},
        headers=admin_headers
    )
    assert res_review.status_code == 200
    assert res_review.get_json()["data"]["status"] == "Under Review"

    # 2. Update to 'Shortlisted'
    res_shortlist = client.patch(
        f"/api/applications/{app_id}/status",
        json={"status": "Shortlisted"},
        headers=admin_headers
    )
    assert res_shortlist.status_code == 200
    assert res_shortlist.get_json()["data"]["status"] == "Shortlisted"

    # 3. Update to 'Selected'
    res_select = client.patch(
        f"/api/applications/{app_id}/status",
        json={"status": "Selected"},
        headers=admin_headers
    )
    assert res_select.status_code == 200
    assert res_select.get_json()["data"]["status"] == "Selected"


def test_update_status_invalid_value(client, student1_headers, admin_headers):
    """Test invalid status value is rejected with 400 Bad Request."""
    res_app = client.post(
        "/api/applications",
        json={"internship_id": 1, "resume_url": "https://resume.com/s1"},
        headers=student1_headers
    )
    app_id = res_app.get_json()["data"]["id"]

    res_invalid = client.patch(
        f"/api/applications/{app_id}/status",
        json={"status": "HiredDirectlyWithoutInterview"},
        headers=admin_headers
    )
    assert res_invalid.status_code == 400
    assert "invalid status" in res_invalid.get_json()["error"].lower()


def test_jwt_bearer_authentication_integration(client, jwt_student_headers, jwt_admin_headers):
    """
    Test Member 1 JWT integration: Verify that JWT Bearer token correctly authenticates
    student and admin without header spoofing.
    """
    # Student applies via JWT token
    res = client.post(
        "/api/applications",
        json={"internship_id": 2, "resume_url": "https://drive.google.com/jwt-student"},
        headers=jwt_student_headers
    )
    assert res.status_code == 201
    app_id = res.get_json()["data"]["id"]
    assert res.get_json()["data"]["student_id"] == 10

    # Student cannot change status with JWT
    res_fail = client.patch(
        f"/api/applications/{app_id}/status",
        json={"status": "Shortlisted"},
        headers=jwt_student_headers
    )
    assert res_fail.status_code == 403

    # Admin changes status with JWT
    res_ok = client.patch(
        f"/api/applications/{app_id}/status",
        json={"status": "Shortlisted"},
        headers=jwt_admin_headers
    )
    assert res_ok.status_code == 200
    assert res_ok.get_json()["data"]["status"] == "Shortlisted"

