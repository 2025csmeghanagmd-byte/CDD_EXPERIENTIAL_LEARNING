"""
CareerBridge - Internship & Application Management Routes
Member 2 ownership:
- Display available internships with search and multi-filtering (domain, type, location)
- Internship details
- Apply for internships with resume and cover letter
- Track application status and history
- Save/bookmark internships
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app import get_db
from app.common.utils import success_response, error_response

internship_bp = Blueprint('internship', __name__)


def _current_user_id_optional():
    """Returns current user id if valid JWT header is present, else None."""
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return int(identity) if identity else None
    except Exception:
        return None


@internship_bp.route('', methods=['GET'])
@internship_bp.route('/', methods=['GET'])
@internship_bp.route('/list', methods=['GET'])
def list_internships():
    """
    Search and filter internships.
    Supports query parameters:
      - search: string match against title, company, description, or skills
      - domain / category: keyword match
      - type: 'remote', 'onsite', 'hybrid'
      - location: string match
      - min_stipend: numeric filter
    """
    try:
        search = request.args.get('search', '').strip()
        intern_type = request.args.get('type', '').strip().lower()
        location = request.args.get('location', '').strip()
        domain = request.args.get('domain', '').strip()
        user_id = _current_user_id_optional()

        conn = get_db()
        try:
            with conn.cursor() as cur:
                query = "SELECT * FROM internships WHERE (is_active = 1 OR is_active IS NULL)"
                params = []

                if search:
                    query += " AND (title LIKE %s OR company LIKE %s OR description LIKE %s OR skills_required LIKE %s)"
                    pattern = f"%{search}%"
                    params.extend([pattern, pattern, pattern, pattern])

                if intern_type and intern_type != 'all':
                    query += " AND LOWER(type) = %s"
                    params.append(intern_type)

                if location and location != 'all':
                    query += " AND LOWER(location) LIKE %s"
                    params.append(f"%{location.lower()}%")

                if domain and domain != 'all':
                    query += " AND (title LIKE %s OR description LIKE %s OR skills_required LIKE %s)"
                    dpattern = f"%{domain}%"
                    params.extend([dpattern, dpattern, dpattern])

                query += " ORDER BY id DESC"
                cur.execute(query, params)
                internships = cur.fetchall()

                # If user is authenticated, determine bookmark and application status
                bookmarked_ids = set()
                applied_ids = set()
                if user_id:
                    try:
                        cur.execute("SELECT internship_id FROM bookmarks WHERE user_id = %s", (user_id,))
                        bookmarked_ids = {r['internship_id'] for r in cur.fetchall()}

                        cur.execute("SELECT internship_id FROM applications WHERE user_id = %s", (user_id,))
                        applied_ids = {r['internship_id'] for r in cur.fetchall()}
                    except Exception:
                        pass

                result = []
                for item in internships:
                    d = dict(item)
                    d['is_bookmarked'] = d['id'] in bookmarked_ids
                    d['has_applied'] = d['id'] in applied_ids
                    result.append(d)

            return success_response(
                data={"internships": result, "count": len(result)},
                message="Internships retrieved successfully"
            )
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to fetch internships: {str(e)}", 500)


@internship_bp.route('/<int:internship_id>', methods=['GET'])
def get_internship_detail(internship_id):
    """Get single internship details."""
    try:
        user_id = _current_user_id_optional()
        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM internships WHERE id = %s", (internship_id,))
                item = cur.fetchone()
                if not item:
                    return error_response("Internship not found", 404)

                d = dict(item)
                d['is_bookmarked'] = False
                d['has_applied'] = False

                if user_id:
                    cur.execute(
                        "SELECT id FROM bookmarks WHERE user_id = %s AND internship_id = %s",
                        (user_id, internship_id)
                    )
                    d['is_bookmarked'] = cur.fetchone() is not None

                    cur.execute(
                        "SELECT id, status, applied_at FROM applications WHERE user_id = %s AND internship_id = %s",
                        (user_id, internship_id)
                    )
                    app = cur.fetchone()
                    if app:
                        d['has_applied'] = True
                        d['application_status'] = app['status']

                # Get applicant count
                cur.execute("SELECT COUNT(*) as count FROM applications WHERE internship_id = %s", (internship_id,))
                cnt = cur.fetchone()
                d['applicant_count'] = cnt['count'] if cnt else 0

            return success_response(data={"internship": d})
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to retrieve details: {str(e)}", 500)


@internship_bp.route('/apply', methods=['POST'])
@jwt_required()
def apply_internship():
    """Apply for an internship."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        internship_id = data.get('internship_id')
        cover_letter = data.get('cover_letter', '').strip()
        resume_url = data.get('resume_url', '').strip()

        if not internship_id:
            return error_response("internship_id is required", 400)

        conn = get_db()
        try:
            with conn.cursor() as cur:
                # Check internship exists
                cur.execute("SELECT id, title, company FROM internships WHERE id = %s", (internship_id,))
                intern = cur.fetchone()
                if not intern:
                    return error_response("Internship not found", 404)

                # Check if already applied
                cur.execute(
                    "SELECT id, status FROM applications WHERE user_id = %s AND internship_id = %s",
                    (user_id, internship_id)
                )
                existing = cur.fetchone()
                if existing:
                    return error_response("You have already applied for this internship.", 400)

                # Insert application
                cur.execute(
                    """
                    INSERT INTO applications (user_id, internship_id, status, cover_letter, resume_url)
                    VALUES (%s, %s, 'pending', %s, %s)
                    """,
                    (user_id, internship_id, cover_letter, resume_url)
                )
                conn.commit()

            return success_response(
                message=f"Application submitted successfully for {intern['title']} at {intern['company']}!"
            )
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Application submission failed: {str(e)}", 500)


@internship_bp.route('/my-applications', methods=['GET'])
@jwt_required()
def my_applications():
    """List all applications submitted by the authenticated student."""
    try:
        user_id = int(get_jwt_identity())
        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT a.id as application_id, a.status, a.applied_at, a.cover_letter,
                           i.id as internship_id, i.title, i.company, i.location, i.type, i.stipend, i.duration
                    FROM applications a
                    JOIN internships i ON a.internship_id = i.id
                    WHERE a.user_id = %s
                    ORDER BY a.applied_at DESC
                    """,
                    (user_id,)
                )
                apps = cur.fetchall()

            return success_response(
                data={"applications": apps, "count": len(apps)},
                message="Applications history retrieved successfully"
            )
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to fetch application history: {str(e)}", 500)


@internship_bp.route('/bookmark', methods=['POST'])
@jwt_required()
def toggle_bookmark():
    """Toggle bookmark for an internship."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        internship_id = data.get('internship_id')

        if not internship_id:
            return error_response("internship_id is required", 400)

        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id FROM bookmarks WHERE user_id = %s AND internship_id = %s",
                    (user_id, internship_id)
                )
                existing = cur.fetchone()

                if existing:
                    cur.execute("DELETE FROM bookmarks WHERE id = %s", (existing['id'],))
                    conn.commit()
                    return success_response(data={"bookmarked": False}, message="Bookmark removed")
                else:
                    cur.execute(
                        "INSERT INTO bookmarks (user_id, internship_id) VALUES (%s, %s)",
                        (user_id, internship_id)
                    )
                    conn.commit()
                    return success_response(data={"bookmarked": True}, message="Internship bookmarked")
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to toggle bookmark: {str(e)}", 500)


@internship_bp.route('/my-bookmarks', methods=['GET'])
@jwt_required()
def my_bookmarks():
    """List all bookmarked internships for the authenticated student."""
    try:
        user_id = int(get_jwt_identity())
        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT b.id as bookmark_id, b.created_at as bookmarked_at,
                           i.*
                    FROM bookmarks b
                    JOIN internships i ON b.internship_id = i.id
                    WHERE b.user_id = %s
                    ORDER BY b.created_at DESC
                    """,
                    (user_id,)
                )
                items = cur.fetchall()

            return success_response(
                data={"bookmarks": items, "count": len(items)},
                message="Bookmarks retrieved successfully"
            )
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to fetch bookmarks: {str(e)}", 500)
