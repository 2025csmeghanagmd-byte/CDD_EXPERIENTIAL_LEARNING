"""
CareerBridge - Campus Skill Exchange Routes
Member 5 ownership:
- Multidisciplinary peer-to-peer knowledge sharing marketplace
- Students list skills they can teach (offers) or want to learn (requests)
- Paid service listings option or free campus exchange
- Send and manage learning requests (accept/reject/complete)
- Peer reviews and ratings
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app import get_db
from app.common.utils import success_response, error_response

skill_exchange_bp = Blueprint('skill_exchange', __name__)


def _current_user_id_optional():
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return int(identity) if identity else None
    except Exception:
        return None


@skill_exchange_bp.route('', methods=['GET'])
@skill_exchange_bp.route('/', methods=['GET'])
@skill_exchange_bp.route('/listings', methods=['GET'])
def get_listings():
    """
    Browse skill listings.
    Supports query parameters:
      - type: 'offer', 'request', 'all'
      - search: string match against skill_name or description
      - is_paid: 1 or 0
    """
    try:
        listing_type = request.args.get('type', '').strip().lower()
        search = request.args.get('search', '').strip()
        user_id = _current_user_id_optional()

        conn = get_db()
        try:
            with conn.cursor() as cur:
                query = """
                    SELECT l.*, u.name as user_name, u.email as user_email,
                           u.college as user_college, u.department as user_department
                    FROM skill_listings l
                    JOIN users u ON l.user_id = u.id
                    WHERE (l.status = 'active' OR l.status IS NULL)
                """
                params = []

                if listing_type and listing_type in ('offer', 'request'):
                    query += " AND l.type = %s"
                    params.append(listing_type)

                if search:
                    query += " AND (l.skill_name LIKE %s OR l.description LIKE %s OR u.name LIKE %s)"
                    pattern = f"%{search}%"
                    params.extend([pattern, pattern, pattern])

                query += " ORDER BY l.created_at DESC"
                cur.execute(query, params)
                listings = cur.fetchall()

                # Add boolean is_owner
                for item in listings:
                    item['is_owner'] = (user_id is not None and item['user_id'] == user_id)

            return success_response(
                data={"listings": listings, "count": len(listings)},
                message="Skill listings retrieved successfully"
            )
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to fetch listings: {str(e)}", 500)


@skill_exchange_bp.route('/listings', methods=['POST'])
@jwt_required()
def create_listing():
    """Create a new skill offer or request."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        skill_name = data.get('skill_name', '').strip()
        description = data.get('description', '').strip()
        listing_type = data.get('type', 'offer').strip().lower()
        is_paid = 1 if data.get('is_paid') in (True, 1, '1', 'true') else 0
        price = float(data.get('price', 0)) if is_paid else 0.0

        if not skill_name:
            return error_response("skill_name is required", 400)

        if listing_type not in ('offer', 'request'):
            return error_response("type must be either 'offer' or 'request'", 400)

        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO skill_listings (user_id, skill_name, description, type, is_paid, price, status)
                    VALUES (%s, %s, %s, %s, %s, %s, 'active')
                    """,
                    (user_id, skill_name, description, listing_type, is_paid, price)
                )
                conn.commit()

            return success_response(
                message=f"Your skill {listing_type} for '{skill_name}' has been posted to campus!"
            )
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to create listing: {str(e)}", 500)


@skill_exchange_bp.route('/request', methods=['POST'])
@jwt_required()
def send_exchange_request():
    """Send a learning/collaboration request for a listing."""
    try:
        requester_id = int(get_jwt_identity())
        data = request.get_json() or {}
        listing_id = data.get('listing_id')
        message = data.get('message', '').strip()

        if not listing_id:
            return error_response("listing_id is required", 400)

        conn = get_db()
        try:
            with conn.cursor() as cur:
                # Check listing exists and user is not owner
                cur.execute("SELECT * FROM skill_listings WHERE id = %s", (listing_id,))
                listing = cur.fetchone()
                if not listing:
                    return error_response("Skill listing not found", 404)

                if listing['user_id'] == requester_id:
                    return error_response("You cannot send an exchange request to your own listing.", 400)

                # Check if already requested
                cur.execute(
                    "SELECT id FROM exchange_requests WHERE listing_id = %s AND requester_id = %s",
                    (listing_id, requester_id)
                )
                if cur.fetchone():
                    return error_response("You have already sent a request for this listing.", 400)

                cur.execute(
                    """
                    INSERT INTO exchange_requests (listing_id, requester_id, message, status)
                    VALUES (%s, %s, %s, 'pending')
                    """,
                    (listing_id, requester_id, message)
                )
                conn.commit()

            return success_response(message="Exchange request sent successfully!")
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to send exchange request: {str(e)}", 500)


@skill_exchange_bp.route('/my-requests', methods=['GET'])
@jwt_required()
def get_my_requests():
    """
    Get user's exchange activities:
    - sent: requests sent by the student
    - received: requests received by the student for their listings
    """
    try:
        user_id = int(get_jwt_identity())
        conn = get_db()
        try:
            with conn.cursor() as cur:
                # Sent requests
                cur.execute("""
                    SELECT r.*, l.skill_name, l.type as listing_type,
                           u.name as owner_name, u.email as owner_email, u.college as owner_college
                    FROM exchange_requests r
                    JOIN skill_listings l ON r.listing_id = l.id
                    JOIN users u ON l.user_id = u.id
                    WHERE r.requester_id = %s
                    ORDER BY r.created_at DESC
                """, (user_id,))
                sent = cur.fetchall()

                # Received requests
                cur.execute("""
                    SELECT r.*, l.skill_name, l.type as listing_type,
                           u.name as requester_name, u.email as requester_email, u.college as requester_college
                    FROM exchange_requests r
                    JOIN skill_listings l ON r.listing_id = l.id
                    JOIN users u ON r.requester_id = u.id
                    WHERE l.user_id = %s
                    ORDER BY r.created_at DESC
                """, (user_id,))
                received = cur.fetchall()

            return success_response(
                data={
                    "sent": sent,
                    "received": received,
                    "total_count": len(sent) + len(received)
                },
                message="Exchange requests loaded"
            )
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to load requests: {str(e)}", 500)


@skill_exchange_bp.route('/requests/<int:request_id>/status', methods=['PUT'])
@jwt_required()
def update_request_status(request_id):
    """Accept, reject, or complete an exchange request."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        new_status = data.get('status', '').strip().lower()

        if new_status not in ('accepted', 'rejected', 'completed'):
            return error_response("Invalid status. Must be accepted, rejected, or completed.", 400)

        conn = get_db()
        try:
            with conn.cursor() as cur:
                # Verify permission: either owner of listing or requester
                cur.execute("""
                    SELECT r.id, l.user_id as owner_id, r.requester_id
                    FROM exchange_requests r
                    JOIN skill_listings l ON r.listing_id = l.id
                    WHERE r.id = %s
                """, (request_id,))
                req = cur.fetchone()

                if not req:
                    return error_response("Exchange request not found", 404)

                if user_id != req['owner_id'] and user_id != req['requester_id']:
                    return error_response("Unauthorized to modify this request", 403)

                cur.execute(
                    "UPDATE exchange_requests SET status = %s WHERE id = %s",
                    (new_status, request_id)
                )
                conn.commit()

            return success_response(message=f"Request status updated to '{new_status}'.")
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to update request: {str(e)}", 500)


@skill_exchange_bp.route('/reviews', methods=['POST'])
@jwt_required()
def submit_review():
    """Submit rating and review for a student peer."""
    try:
        reviewer_id = int(get_jwt_identity())
        data = request.get_json() or {}
        reviewed_user_id = data.get('reviewed_user_id')
        listing_id = data.get('listing_id')
        rating = int(data.get('rating', 5))
        comment = data.get('comment', '').strip()

        if not reviewed_user_id:
            return error_response("reviewed_user_id is required", 400)

        if rating < 1 or rating > 5:
            return error_response("Rating must be between 1 and 5", 400)

        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO reviews (reviewer_id, reviewed_user_id, listing_id, rating, comment)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (reviewer_id, reviewed_user_id, listing_id, rating, comment)
                )
                conn.commit()

            return success_response(message="Thank you! Review and rating submitted.")
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to submit review: {str(e)}", 500)


@skill_exchange_bp.route('/reviews/<int:user_id>', methods=['GET'])
def get_user_reviews(user_id):
    """Get all reviews and average rating for a student."""
    try:
        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT r.*, u.name as reviewer_name
                    FROM reviews r
                    JOIN users u ON r.reviewer_id = u.id
                    WHERE r.reviewed_user_id = %s
                    ORDER BY r.created_at DESC
                """, (user_id,))
                reviews = cur.fetchall()

                avg_rating = 0
                if reviews:
                    avg_rating = round(sum(r['rating'] for r in reviews) / len(reviews), 1)

            return success_response(data={
                "reviews": reviews,
                "count": len(reviews),
                "average_rating": avg_rating
            })
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to fetch reviews: {str(e)}", 500)
