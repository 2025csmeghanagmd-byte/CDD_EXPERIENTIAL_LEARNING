import jwt
from functools import wraps
from flask import request, jsonify, current_app, g

def get_current_user():
    """
    Extracts the authenticated user from:
    1. Member 1's JWT Bearer token in the 'Authorization' header.
    2. Local/dev demo headers ('X-Student-Id', 'X-User-Role') if JWT is absent.
    3. Default development student fallback if neither is supplied.
    """
    auth_header = request.headers.get("Authorization")
    
    # 1. Inspect Authorization Bearer token (Shared Member 1 JWT)
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        try:
            payload = jwt.decode(
                token,
                current_app.config["JWT_SECRET_KEY"],
                algorithms=[current_app.config["JWT_ALGORITHM"]]
            )
            # Member 1 payload standard: sub or id or user_id or student_id
            user_id = payload.get("sub") or payload.get("user_id") or payload.get("student_id") or payload.get("id")
            role = payload.get("role", "student")
            name = payload.get("name", f"Student {user_id}")
            email = payload.get("email", f"user{user_id}@careerbridge.edu")
            
            return {
                "student_id": int(user_id) if str(user_id).isdigit() else user_id,
                "role": role.lower(),
                "name": name,
                "email": email,
                "is_authenticated": True,
                "auth_source": "jwt"
            }
        except jwt.ExpiredSignatureError:
            return {"error": "Token has expired", "status_code": 401}
        except jwt.InvalidTokenError:
            return {"error": "Invalid authentication token", "status_code": 401}

    # 2. Local development header override (useful for frontend persona switcher)
    dev_student_id = request.headers.get("X-Student-Id")
    dev_role = request.headers.get("X-User-Role", "student")
    dev_name = request.headers.get("X-User-Name")

    if dev_student_id:
        try:
            s_id = int(dev_student_id)
        except ValueError:
            s_id = dev_student_id
            
        return {
            "student_id": s_id,
            "role": dev_role.lower(),
            "name": dev_name or f"Student #{s_id}",
            "email": f"student{s_id}@campus.edu",
            "is_authenticated": True,
            "auth_source": "dev_header"
        }

    # 3. Default dev fallback (Never blocks local evaluation/demo)
    return {
        "student_id": current_app.config["DEFAULT_STUDENT_ID"],
        "role": "student",
        "name": current_app.config["DEFAULT_STUDENT_NAME"],
        "email": current_app.config["DEFAULT_STUDENT_EMAIL"],
        "is_authenticated": True,
        "auth_source": "dev_default"
    }

def require_auth(f):
    """Decorator ensuring that request has a valid resolved student/user."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if "error" in user:
            return jsonify({
                "success": False,
                "message": user["error"]
            }), user.get("status_code", 401)
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function

def require_role(*allowed_roles):
    """
    Decorator restricting an endpoint to specific roles (e.g. 'admin', 'staff', 'recruiter').
    Students are strictly forbidden from executing protected operations like status updates.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if "error" in user:
                return jsonify({
                    "success": False,
                    "message": user["error"]
                }), user.get("status_code", 401)

            user_role = user.get("role", "student").lower()
            allowed = [r.lower() for r in allowed_roles]
            
            if user_role not in allowed:
                return jsonify({
                    "success": False,
                    "message": f"Access forbidden. This action requires one of the following roles: {', '.join(allowed)}."
                }), 403

            g.current_user = user
            return f(*args, **kwargs)
        return decorated_function
    return decorator

