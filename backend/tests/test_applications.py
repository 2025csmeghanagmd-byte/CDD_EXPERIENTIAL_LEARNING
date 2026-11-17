import pytest

def test_apply_for_internship_success(client, student1_headers):
    """Test successful submission of an application."""
    payload = {
        "internship_id": 1,
        "resume_url": "https://drive.google.com/file/d/my-resume/view",
        "cover_letter": "I am deeply passionate about React development and UI architecture.",
        "relevant_skills": "React, Tailwind, TypeScript"
    }
    response = client.post("/api/applications", json=payload, headers=student1_headers)
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True
    assert data["data"]["status"] == "Applied"
    assert data["data"]["student_id"] == 1
    assert data["data"]["internship_id"] == 1
    assert data["data"]["internship"]["title"] == "Frontend React Engineer"


def test_apply_missing_resume_url_validation(client, student1_headers):
    """Test validation fails when resume_url is missing."""
    payload = {
        "internship_id": 1,
        "resume_url": "",
        "cover_letter": "Valid cover letter"
    }
    response = client.post("/api/applications", json=payload, headers=student1_headers)
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert "resume_url" in data["validation_errors"]


def test_apply_invalid_resume_url_format(client, student1_headers):
    """Test validation fails for invalid web url."""
    payload = {
        "internship_id": 1,
        "resume_url": "not-a-valid-url"
    }
    response = client.post("/api/applications", json=payload, headers=student1_headers)
    assert response.status_code == 400
    data = response.get_json()
    assert "resume_url" in data["validation_errors"]


def test_apply_duplicate_application_prevention(client, student1_headers):
    """Test that applying twice for the same internship returns 409 Conflict."""
    payload = {
        "internship_id": 1,
        "resume_url": "https://linkedin.com/in/alex-johnson"
    }
    # First application: should succeed
    res1 = client.post("/api/applications", json=payload, headers=student1_headers)
    assert res1.status_code == 201

    # Second application: should fail with 409 Conflict
    res2 = client.post("/api/applications", json=payload, headers=student1_headers)
    assert res2.status_code == 409
    data2 = res2.get_json()
    assert data2["success"] is False
    assert "already applied" in data2["error"].lower()


def test_apply_nonexistent_internship(client, student1_headers):
    """Test applying to non-existent internship returns 404."""
    payload = {
        "internship_id": 9999,
        "resume_url": "https://portfolio.dev/resume.pdf"
    }
    response = client.post("/api/applications", json=payload, headers=student1_headers)
    assert response.status_code == 404
    data = response.get_json()
    assert data["success"] is False
    assert "not found" in data["error"].lower()


def test_get_my_applications(client, student1_headers, student2_headers):
    """Test student retrieving their submitted applications."""
    # Student 1 applies to internship 1 and 2
    client.post("/api/applications", json={"internship_id": 1, "resume_url": "https://resume.com/1"}, headers=student1_headers)
    client.post("/api/applications", json={"internship_id": 2, "resume_url": "https://resume.com/2"}, headers=student1_headers)

    # Student 2 applies to internship 1
    client.post("/api/applications", json={"internship_id": 1, "resume_url": "https://resume.com/s2"}, headers=student2_headers)

    # Student 1 views their applications
    res1 = client.get("/api/applications/my", headers=student1_headers)
    assert res1.status_code == 200
    data1 = res1.get_json()
    assert data1["success"] is True
    assert data1["count"] == 2
    assert len(data1["data"]) == 2

    # Student 2 views their applications
    res2 = client.get("/api/applications/my", headers=student2_headers)
    assert res2.status_code == 200
    data2 = res2.get_json()
    assert data2["count"] == 1


def test_get_application_by_id_ownership(client, student1_headers, student2_headers, admin_headers):
    """Test student can view their own application, but not other students' application."""
    res_create = client.post(
        "/api/applications",
        json={"internship_id": 1, "resume_url": "https://resume.com/s1"},
        headers=student1_headers
    )
    app_id = res_create.get_json()["data"]["id"]

    # Student 1 can view their own application
    res_own = client.get(f"/api/applications/{app_id}", headers=student1_headers)
    assert res_own.status_code == 200
    assert res_own.get_json()["data"]["id"] == app_id

    # Student 2 tries to view Student 1's application -> 403 Forbidden
    res_other = client.get(f"/api/applications/{app_id}", headers=student2_headers)
    assert res_other.status_code == 403
    assert "unauthorized" in res_other.get_json()["error"].lower()

    # Admin CAN view Student 1's application
    res_admin = client.get(f"/api/applications/{app_id}", headers=admin_headers)
    assert res_admin.status_code == 200
    assert res_admin.get_json()["data"]["id"] == app_id

