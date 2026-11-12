import pytest

def test_add_bookmark_success(client, student1_headers):
    """Test bookmarking an internship."""
    response = client.post("/api/internships/1/bookmark", headers=student1_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["is_bookmarked"] is True


def test_add_duplicate_bookmark_idempotent(client, student1_headers):
    """Test duplicate bookmarking is handled gracefully without crashing."""
    res1 = client.post("/api/internships/1/bookmark", headers=student1_headers)
    assert res1.status_code == 200

    res2 = client.post("/api/internships/1/bookmark", headers=student1_headers)
    assert res2.status_code == 200
    data2 = res2.get_json()
    assert data2["success"] is True
    assert "already" in data2["message"].lower()


def test_get_bookmarks(client, student1_headers, student2_headers):
    """Test retrieving saved bookmarks for a student."""
    client.post("/api/internships/1/bookmark", headers=student1_headers)
    client.post("/api/internships/2/bookmark", headers=student1_headers)

    res = client.get("/api/bookmarks", headers=student1_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["count"] == 2
    assert len(data["data"]) == 2
    assert "internship" in data["data"][0]

    # Student 2 has 0 bookmarks
    res2 = client.get("/api/bookmarks", headers=student2_headers)
    assert res2.status_code == 200
    assert res2.get_json()["count"] == 0


def test_delete_bookmark_success(client, student1_headers):
    """Test removing a bookmark."""
    client.post("/api/internships/1/bookmark", headers=student1_headers)
    
    # Delete bookmark
    res_del = client.delete("/api/internships/1/bookmark", headers=student1_headers)
    assert res_del.status_code == 200
    assert res_del.get_json()["success"] is True
    assert res_del.get_json()["is_bookmarked"] is False

    # Check bookmarks list is now empty
    res_list = client.get("/api/bookmarks", headers=student1_headers)
    assert res_list.get_json()["count"] == 0


def test_delete_nonexistent_bookmark(client, student1_headers):
    """Test deleting a bookmark that wasn't created returns 404."""
    response = client.delete("/api/internships/3/bookmark", headers=student1_headers)
    assert response.status_code == 404
    assert response.get_json()["success"] is False

