import pytest

def test_list_internships_success(client):
    """Test retrieving list of internships with pagination."""
    response = client.get("/api/internships")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert len(data["data"]) == 3
    assert data["pagination"]["total_items"] == 3
    assert data["pagination"]["page"] == 1


def test_search_internships_by_title_and_skills(client):
    """Test searching internships by keyword in title and skills."""
    # Search by title keyword 'React'
    res_react = client.get("/api/internships?search=React")
    assert res_react.status_code == 200
    data_react = res_react.get_json()
    assert len(data_react["data"]) == 1
    assert data_react["data"][0]["title"] == "Frontend React Engineer"

    # Search by skill keyword 'Docker'
    res_docker = client.get("/api/internships?search=Docker")
    assert res_docker.status_code == 200
    data_docker = res_docker.get_json()
    assert len(data_docker["data"]) == 1
    assert data_docker["data"][0]["company_name"] == "Beta Systems"


def test_filter_internships_by_work_mode(client):
    """Test filtering by work mode (Remote vs Hybrid)."""
    res_remote = client.get("/api/internships?work_mode=Remote")
    assert res_remote.status_code == 200
    data = res_remote.get_json()
    assert len(data["data"]) == 2  # Alpha Tech and Gamma Labs

    res_hybrid = client.get("/api/internships?work_mode=Hybrid")
    assert res_hybrid.status_code == 200
    data_h = res_hybrid.get_json()
    assert len(data_h["data"]) == 1
    assert data_h["data"][0]["company_name"] == "Beta Systems"


def test_filter_internships_by_location(client):
    """Test filtering by location."""
    res_bengaluru = client.get("/api/internships?location=Bengaluru")
    assert res_bengaluru.status_code == 200
    data = res_bengaluru.get_json()
    assert len(data["data"]) == 1
    assert data["data"][0]["location"] == "Bengaluru, Karnataka"


def test_filter_internships_by_paid_status(client):
    """Test filtering by paid vs unpaid."""
    res_unpaid = client.get("/api/internships?is_paid=false")
    assert res_unpaid.status_code == 200
    data = res_unpaid.get_json()
    assert len(data["data"]) == 1
    assert data["data"][0]["title"] == "Open Source Documentation Intern"

    res_paid = client.get("/api/internships?is_paid=true")
    assert res_paid.status_code == 200
    data_paid = res_paid.get_json()
    assert len(data_paid["data"]) == 2


def test_sort_internships_by_deadline(client):
    """Test sorting internships by application deadline."""
    response = client.get("/api/internships?sort_by=deadline")
    assert response.status_code == 200
    data = response.get_json()
    # Earliest deadline first: Gamma Labs (10 days) < Beta Systems (15 days) < Alpha Tech (20 days)
    assert data["data"][0]["company_name"] == "Gamma Labs"


def test_get_single_internship_success(client):
    """Test fetching details of an existing internship."""
    response = client.get("/api/internships/1")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["data"]["id"] == 1
    assert data["data"]["title"] == "Frontend React Engineer"
    assert "skills_list" in data["data"]
    assert "React" in data["data"]["skills_list"]


def test_get_single_internship_not_found(client):
    """Test fetching a non-existent internship returns 404."""
    response = client.get("/api/internships/9999")
    assert response.status_code == 404
    data = response.get_json()
    assert data["success"] is False
    assert "not found" in data["error"].lower()


def test_get_internship_statistics(client):
    """Test statistics endpoint."""
    response = client.get("/api/internships/stats")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["data"]["total_available_internships"] == 3
    assert data["data"]["total_applications"] == 0

