from flask import request, jsonify, g
from app.internship import internship_bp
from app.auth_middleware import require_auth, require_role, get_current_user
from app.internship.schemas import validate_application_data, validate_status_update
from app.internship import services

@internship_bp.route("/internships", methods=["GET"])
def list_internships():
    """
    GET /api/internships
    List available internships with search, filtering, sorting, and pagination.
    """
    user = get_current_user()
    student_id = user.get("student_id") if "error" not in user else None

    filters = {
        "search": request.args.get("search", ""),
        "location": request.args.get("location", ""),
        "work_mode": request.args.get("work_mode", ""),
        "is_paid": request.args.get("is_paid", None),
        "sort_by": request.args.get("sort_by", "latest")
    }
    
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 9, type=int)

    result = services.get_internships(filters=filters, student_id=student_id, page=page, limit=limit)
    return jsonify({
        "success": True,
        "data": result["internships"],
        "pagination": result["pagination"]
    }), 200


@internship_bp.route("/internships/<int:internship_id>", methods=["GET"])
def get_internship(internship_id):
    """
    GET /api/internships/<id>
    Retrieve full details for a single internship.
    """
    user = get_current_user()
    student_id = user.get("student_id") if "error" not in user else None

    data = services.get_internship_by_id(internship_id=internship_id, student_id=student_id)
    if not data:
        return jsonify({
            "success": False,
            "error": "Internship not found with the specified ID."
        }), 404

    return jsonify({
        "success": True,
        "data": data
    }), 200


@internship_bp.route("/applications", methods=["POST"])
@require_auth
def create_application():
    """
    POST /api/applications
    Submit a new internship application for the authenticated student.
    Prevents duplicate submissions for the same internship.
    """
    student_id = g.current_user["student_id"]
    payload = request.get_json(silent=True) or {}

    is_valid, validation_result = validate_application_data(payload)
    if not is_valid:
        return jsonify({
            "success": False,
            "error": "Validation failed",
            "validation_errors": validation_result
        }), 400

    success, result = services.apply_for_internship(student_id=student_id, data=validation_result)
    if not success:
        return jsonify({
            "success": False,
            "error": result.get("error", "Application failed"),
            "details": result
        }), result.get("status_code", 400)

    return jsonify({
        "success": True,
        "message": "Application submitted successfully! Your application is now Under Review.",
        "data": result
    }), 201


@internship_bp.route("/applications/my", methods=["GET"])
@require_auth
def get_my_applications():
    """
    GET /api/applications/my
    Fetch all applications submitted by the logged-in student.
    """
    student_id = g.current_user["student_id"]
    status_filter = request.args.get("status", None)

    applications = services.get_student_applications(student_id=student_id, status_filter=status_filter)
    return jsonify({
        "success": True,
        "count": len(applications),
        "data": applications
    }), 200


@internship_bp.route("/applications/<int:application_id>", methods=["GET"])
@require_auth
def get_single_application(application_id):
    """
    GET /api/applications/<id>
    View a specific application, enforcing ownership authorization.
    """
    student_id = g.current_user["student_id"]
    is_admin = g.current_user.get("role") in ["admin", "staff", "recruiter"]

    success, result = services.get_application_by_id(
        application_id=application_id,
        student_id=student_id,
        is_admin=is_admin
    )

    if not success:
        return jsonify({
            "success": False,
            "error": result.get("error")
        }), result.get("status_code", 404)

    return jsonify({
        "success": True,
        "data": result
    }), 200


@internship_bp.route("/applications/<int:application_id>/status", methods=["PATCH", "PUT"])
@require_role("admin", "staff", "recruiter")
def update_status(application_id):
    """
    PATCH /api/applications/<id>/status
    Update application status (Applied -> Under Review -> Shortlisted -> Selected / Rejected).
    RESTRICTED: Students are strictly forbidden from modifying their own status.
    """
    payload = request.get_json(silent=True) or {}
    is_valid, validation_result = validate_status_update(payload)
    
    if not is_valid:
        return jsonify({
            "success": False,
            "error": validation_result
        }), 400

    user_role = g.current_user.get("role", "admin")
    success, result = services.update_application_status(
        application_id=application_id,
        new_status=validation_result,
        user_role=user_role
    )

    if not success:
        return jsonify({
            "success": False,
            "error": result.get("error")
        }), result.get("status_code", 400)

    return jsonify({
        "success": True,
        "message": f"Application status updated to '{validation_result}' successfully.",
        "data": result
    }), 200


@internship_bp.route("/internships/<int:internship_id>/bookmark", methods=["POST"])
@require_auth
def add_bookmark(internship_id):
    """
    POST /api/internships/<id>/bookmark
    Bookmark an internship for the authenticated student.
    """
    student_id = g.current_user["student_id"]
    success, result = services.toggle_bookmark(student_id=student_id, internship_id=internship_id)

    if not success:
        return jsonify({
            "success": False,
            "error": result.get("error")
        }), result.get("status_code", 400)

    return jsonify({
        "success": True,
        "message": result.get("message"),
        "is_bookmarked": result.get("is_bookmarked")
    }), 200


@internship_bp.route("/internships/<int:internship_id>/bookmark", methods=["DELETE"])
@require_auth
def delete_bookmark(internship_id):
    """
    DELETE /api/internships/<id>/bookmark
    Remove bookmark for an internship for the authenticated student.
    """
    student_id = g.current_user["student_id"]
    success, result = services.remove_bookmark(student_id=student_id, internship_id=internship_id)

    if not success:
        return jsonify({
            "success": False,
            "error": result.get("error")
        }), result.get("status_code", 404)

    return jsonify({
        "success": True,
        "message": result.get("message"),
        "is_bookmarked": result.get("is_bookmarked")
    }), 200


@internship_bp.route("/bookmarks", methods=["GET"])
@require_auth
def get_my_bookmarks():
    """
    GET /api/bookmarks
    Retrieve all bookmarked internships for the authenticated student.
    """
    student_id = g.current_user["student_id"]
    bookmarks = services.get_student_bookmarks(student_id=student_id)

    return jsonify({
        "success": True,
        "count": len(bookmarks),
        "data": bookmarks
    }), 200


@internship_bp.route("/internships/stats", methods=["GET"])
def get_stats():
    """
    GET /api/internships/stats
    Retrieve aggregate statistics for dashboard summary tiles.
    """
    user = get_current_user()
    student_id = user.get("student_id") if "error" not in user else 1

    stats = services.get_internship_statistics(student_id=student_id)
    return jsonify({
        "success": True,
        "data": stats
    }), 200


@internship_bp.route("/internships/seed", methods=["POST"])
def seed_data():
    """
    POST /api/internships/seed
    Seeds sample internship records for demonstration and faculty review.
    """
    success, message = services.seed_sample_internships()
    return jsonify({
        "success": success,
        "message": message
    }), 200 if success else 200

