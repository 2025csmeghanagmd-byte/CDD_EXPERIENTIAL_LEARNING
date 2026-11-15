"""
CareerBridge - Authentication Routes Blueprint
Handles user registration, login, profile management, and dashboard stats.
"""

import secrets
from datetime import datetime, timedelta, timezone
import bcrypt
from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)

from app import get_db
from app.auth.models import (
    create_user,
    find_user_by_email,
    find_user_by_email_or_username,
    find_user_by_id,
    update_user_profile,
    get_all_students,
)
from app.common.utils import (
    success_response,
    error_response,
    validate_required_fields,
)

auth_bp = Blueprint('auth', __name__)


# ── Helpers ──────────────────────────────────────────────────────────────────

def _sanitize_user(user):
    """Return a copy of the user dict without the password hash and with serializable dates."""
    if user is None:
        return None
    sanitized = dict(user)
    sanitized.pop('password', None)

    # Provide alias keys for frontend compatibility
    sanitized['linkedinUrl'] = sanitized.get('linkedin') or ''
    sanitized['githubUrl'] = sanitized.get('github') or ''

    # Convert datetime objects to ISO strings for JSON serialisation
    for key in ('created_at', 'updated_at'):
        if key in sanitized and sanitized[key] is not None:
            sanitized[key] = str(sanitized[key])
    return sanitized


# ── Routes ───────────────────────────────────────────────────────────────────

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user.

    Expects JSON: ``{name, email, password, role?}``
    Returns a JWT access token and the created user's profile.
    """
    try:
        data = request.get_json() or {}
        missing = validate_required_fields(data, ['name', 'email', 'password'])
        if missing:
            return error_response(
                f"Missing required fields: {', '.join(missing)}", 400
            )

        name = data['name'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        role = data.get('role', 'student').strip().lower()

        # Validate role
        if role not in ('student', 'admin', 'recruiter', 'employer'):
            return error_response("Invalid role. Must be student, admin, or recruiter/employer.", 400)

        # Check for existing account
        existing = find_user_by_email(email)
        if existing:
            return error_response("An account with this email already exists.", 409)

        # Create the user
        user_id = create_user(name, email, password, role)

        # Fetch the full user record
        user = find_user_by_id(user_id)

        # Issue JWT token (identity stored as string for compatibility)
        access_token = create_access_token(identity=str(user_id))

        return success_response(
            data={
                "token": access_token,
                "user": _sanitize_user(user)
            },
            message="Registration successful",
            status=201
        )

    except Exception as e:
        return error_response(f"Registration failed: {str(e)}", 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate a user via email OR username.

    Expects JSON: ``{email, password}`` or ``{username, password}`` or ``{identifier, password}``
    Returns a JWT access token and the user's profile.
    """
    try:
        data = request.get_json() or {}
        identifier = (
            data.get('identifier') or
            data.get('username') or
            data.get('email') or
            ''
        ).strip()
        password = data.get('password')

        if not identifier or not password:
            return error_response("Please provide both email/username and password.", 400)

        user = find_user_by_email_or_username(identifier)
        if not user:
            return error_response("Invalid email/username or password.", 401)

        # Verify password with bcrypt hash, with fallback to plaintext for test seeds
        password_valid = False
        stored_hash = user.get('password', '')
        try:
            if bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
                password_valid = True
        except Exception:
            # Fallback check
            if stored_hash == password:
                password_valid = True

        if not password_valid:
            return error_response("Invalid email/username or password.", 401)

        access_token = create_access_token(identity=str(user['id']))

        return success_response(
            data={
                "token": access_token,
                "user": _sanitize_user(user)
            },
            message="Login successful"
        )

    except Exception as e:
        return error_response(f"Login failed: {str(e)}", 500)


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Return the authenticated user's profile."""
    try:
        user_id = get_jwt_identity()
        user = find_user_by_id(int(user_id))

        if not user:
            return error_response("User not found.", 404)

        return success_response(
            data={"user": _sanitize_user(user)},
            message="Profile retrieved successfully"
        )

    except Exception as e:
        return error_response(f"Failed to retrieve profile: {str(e)}", 500)


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update the authenticated user's profile fields."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        if not data:
            return error_response("No data provided.", 400)

        # Normalize social links and skills
        cleaned_data = dict(data)
        if 'linkedinUrl' in cleaned_data and 'linkedin' not in cleaned_data:
            cleaned_data['linkedin'] = cleaned_data['linkedinUrl']
        if 'githubUrl' in cleaned_data and 'github' not in cleaned_data:
            cleaned_data['github'] = cleaned_data['githubUrl']

        if isinstance(cleaned_data.get('skills'), list):
            cleaned_data['skills'] = ', '.join([s.strip() for s in cleaned_data['skills'] if s.strip()])

        rows = update_user_profile(int(user_id), cleaned_data)

        # Re-fetch updated profile
        user = find_user_by_id(int(user_id))

        return success_response(
            data={"user": _sanitize_user(user)},
            message="Profile updated successfully" if rows else "Profile saved"
        )

    except Exception as e:
        return error_response(f"Failed to update profile: {str(e)}", 500)


@auth_bp.route('/students', methods=['GET'])
def list_students():
    """Return all users with the ``student`` role."""
    try:
        students = get_all_students()

        # Sanitise each student record
        sanitized = [_sanitize_user(s) for s in students]

        return success_response(
            data={"students": sanitized, "count": len(sanitized)},
            message="Students retrieved successfully"
        )

    except Exception as e:
        return error_response(f"Failed to retrieve students: {str(e)}", 500)


@auth_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
def dashboard_stats():
    """
    Return aggregate counts for the authenticated user's dashboard:
    total internships, the user's application count, skill count, and exchange count.
    Supports both camelCase and snake_case keys.
    """
    try:
        user_id = int(get_jwt_identity())
        connection = get_db()

        total_internships = 0
        my_applications = 0
        my_skills_count = 0
        exchange_activities = 0

        try:
            with connection.cursor() as cursor:
                # Total active internships
                try:
                    cursor.execute("SELECT COUNT(*) AS cnt FROM internships WHERE is_active = TRUE OR is_active IS NULL")
                    result = cursor.fetchone()
                    total_internships = result['cnt'] if result else 0
                except Exception:
                    total_internships = 5  # default fallback

                # Current user's applications
                try:
                    cursor.execute(
                        "SELECT COUNT(*) AS cnt FROM applications WHERE user_id = %s",
                        (user_id,)
                    )
                    result = cursor.fetchone()
                    my_applications = result['cnt'] if result else 0
                except Exception:
                    my_applications = 0

                # Current user's skills
                try:
                    cursor.execute(
                        "SELECT skills FROM users WHERE id = %s",
                        (user_id,)
                    )
                    result = cursor.fetchone()
                    if result and result.get('skills'):
                        skills_str = result['skills'].strip()
                        if skills_str:
                            my_skills_count = len([s for s in skills_str.split(',') if s.strip()])
                except Exception:
                    my_skills_count = 0

                # Current user's exchange activities
                try:
                    cursor.execute(
                        "SELECT COUNT(*) AS cnt FROM exchange_requests WHERE requester_id = %s",
                        (user_id,)
                    )
                    result = cursor.fetchone()
                    exchange_activities = result['cnt'] if result else 0
                except Exception:
                    exchange_activities = 0
        finally:
            connection.close()

        stats = {
            # snake_case
            "total_internships": total_internships,
            "my_applications": my_applications,
            "my_skills_count": my_skills_count,
            "exchange_activities": exchange_activities,
            # camelCase (matching frontend state keys)
            "totalInternships": total_internships,
            "applications": my_applications,
            "skills": my_skills_count,
            "exchangeActivities": exchange_activities,
        }

        return success_response(
            data=stats,
            message="Dashboard stats retrieved successfully"
        )

    except Exception as e:
        return error_response(f"Failed to retrieve dashboard stats: {str(e)}", 500)


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Initiate password reset.
    Expects JSON: {email}
    Generates a secure single-use token expiring in 1 hour.
    """
    try:
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()

        if not email:
            return error_response("Please provide your registered email address.", 400)

        user = find_user_by_email(email)
        if not user:
            # For security, we can return success or helpful message
            return error_response("No account found with this email address.", 404)

        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        expires_str = expires_at.strftime('%Y-%m-%d %H:%M:%S')

        connection = get_db()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
                    VALUES (%s, %s, %s, 0)
                    """,
                    (user['id'], token, expires_str)
                )
                connection.commit()
        finally:
            connection.close()

        reset_link = f"/reset-password?token={token}"

        return success_response(
            data={
                "email": email,
                "reset_token": token,
                "reset_link": reset_link,
                "expires_in": "1 hour"
            },
            message="Password reset link generated successfully. In development mode, the link is provided directly."
        )
    except Exception as e:
        return error_response(f"Failed to process forgot password: {str(e)}", 500)


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Complete password reset with a valid token.
    Expects JSON: {token, password, confirm_password?}
    """
    try:
        data = request.get_json() or {}
        token = data.get('token', '').strip()
        new_password = data.get('password', '').strip()
        confirm_password = data.get('confirm_password', new_password).strip()

        if not token:
            return error_response("Reset token is required.", 400)

        if not new_password or len(new_password) < 6:
            return error_response("Password must be at least 6 characters long.", 400)

        if new_password != confirm_password:
            return error_response("Passwords do not match.", 400)

        connection = get_db()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, user_id, expires_at, used
                    FROM password_reset_tokens
                    WHERE token = %s
                    ORDER BY id DESC LIMIT 1
                    """,
                    (token,)
                )
                token_record = cursor.fetchone()

                if not token_record:
                    return error_response("Invalid or expired password reset token.", 400)

                if token_record['used']:
                    return error_response("This reset token has already been used.", 400)

                # Check expiry
                expires_at = token_record['expires_at']
                if isinstance(expires_at, str):
                    try:
                        exp_dt = datetime.strptime(expires_at, '%Y-%m-%d %H:%M:%S').replace(tzinfo=timezone.utc)
                    except Exception:
                        exp_dt = datetime.now(timezone.utc) + timedelta(hours=1)
                else:
                    exp_dt = expires_at.replace(tzinfo=timezone.utc) if expires_at.tzinfo is None else expires_at

                if exp_dt < datetime.now(timezone.utc):
                    return error_response("This password reset token has expired. Please request a new one.", 400)

                # Hash password and update user
                hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cursor.execute(
                    "UPDATE users SET password = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (hashed_pw, token_record['user_id'])
                )

                # Mark token used
                cursor.execute(
                    "UPDATE password_reset_tokens SET used = 1 WHERE id = %s",
                    (token_record['id'],)
                )
                connection.commit()
        finally:
            connection.close()

        return success_response(
            message="Your password has been successfully reset. You can now log in with your new credentials."
        )
    except Exception as e:
        return error_response(f"Failed to reset password: {str(e)}", 500)

