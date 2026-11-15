"""
CareerBridge - Skill Gap Analyzer Routes
Member 4 ownership:
- Multidisciplinary career path selection
- Required skills identification for selected target role
- Student skill inventory and proficiency tracking
- Skill gap calculation (Matching vs Missing skills)
- Readiness score percentage
- Curated learning resource recommendations
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app import get_db
from app.common.utils import success_response, error_response

skill_gap_bp = Blueprint('skill_gap', __name__)


def _current_user_id_optional():
    """Returns current user id if valid JWT header is present, else None."""
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return int(identity) if identity else None
    except Exception:
        return None


@skill_gap_bp.route('', methods=['GET'])
@skill_gap_bp.route('/', methods=['GET'])
def index():
    return success_response(message="Skill Gap Analyzer API active")


@skill_gap_bp.route('/roles', methods=['GET'])
def get_job_roles():
    """List all multidisciplinary target job roles with required skills."""
    try:
        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM job_roles ORDER BY id ASC")
                roles = cur.fetchall()

                # Process required_skills string to array for frontend
                for role in roles:
                    skills_str = role.get('required_skills', '')
                    role['skills_list'] = [s.strip() for s in skills_str.split(',') if s.strip()]

            return success_response(data={"job_roles": roles, "count": len(roles)})
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to fetch job roles: {str(e)}", 500)


@skill_gap_bp.route('/user-skills', methods=['GET'])
@jwt_required()
def get_user_skills():
    """Get the current student's registered skills."""
    try:
        user_id = int(get_jwt_identity())
        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM user_skills WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
                skills = cur.fetchall()

                # Also grab user's comma-separated profile skills
                cur.execute("SELECT skills FROM users WHERE id = %s", (user_id,))
                u = cur.fetchone()
                profile_skills = []
                if u and u.get('skills'):
                    profile_skills = [s.strip() for s in u['skills'].split(',') if s.strip()]

            return success_response(data={
                "user_skills": skills,
                "profile_skills": profile_skills,
                "count": len(skills)
            })
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to fetch skills: {str(e)}", 500)


@skill_gap_bp.route('/user-skills', methods=['POST'])
@jwt_required()
def add_user_skill():
    """Add a new skill or update proficiency for the authenticated student."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        skill_name = data.get('skill_name', '').strip()
        proficiency = data.get('proficiency', 'intermediate').strip().lower()

        if not skill_name:
            return error_response("skill_name is required", 400)

        if proficiency not in ('beginner', 'intermediate', 'advanced'):
            proficiency = 'intermediate'

        conn = get_db()
        try:
            with conn.cursor() as cur:
                # Check if exists
                cur.execute(
                    "SELECT id FROM user_skills WHERE user_id = %s AND LOWER(skill_name) = %s",
                    (user_id, skill_name.lower())
                )
                existing = cur.fetchone()

                if existing:
                    cur.execute(
                        "UPDATE user_skills SET proficiency = %s WHERE id = %s",
                        (proficiency, existing['id'])
                    )
                else:
                    cur.execute(
                        "INSERT INTO user_skills (user_id, skill_name, proficiency) VALUES (%s, %s, %s)",
                        (user_id, skill_name, proficiency)
                    )

                # Sync into user's profile skills field if not already present
                cur.execute("SELECT skills FROM users WHERE id = %s", (user_id,))
                u = cur.fetchone()
                curr_skills = [s.strip() for s in (u.get('skills') or '').split(',') if s.strip()]
                if not any(s.lower() == skill_name.lower() for s in curr_skills):
                    curr_skills.append(skill_name)
                    cur.execute(
                        "UPDATE users SET skills = %s WHERE id = %s",
                        (', '.join(curr_skills), user_id)
                    )

                conn.commit()

            return success_response(message=f"Skill '{skill_name}' saved with {proficiency} level.")
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to save skill: {str(e)}", 500)


@skill_gap_bp.route('/user-skills/<int:skill_id>', methods=['DELETE'])
@jwt_required()
def delete_user_skill(skill_id):
    """Delete a skill from student's inventory."""
    try:
        user_id = int(get_jwt_identity())
        conn = get_db()
        try:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM user_skills WHERE id = %s AND user_id = %s", (skill_id, user_id))
                conn.commit()
            return success_response(message="Skill removed successfully")
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to delete skill: {str(e)}", 500)


@skill_gap_bp.route('/analyze', methods=['POST'])
def analyze_skill_gap():
    """
    Compare current student's skills against a target job role.
    Payload: { "job_role_id": 1 }
    Returns: readiness percentage, matching skills, missing skills, and learning resources.
    """
    try:
        user_id = _current_user_id_optional()
        data = request.get_json() or {}
        job_role_id = data.get('job_role_id')

        if not job_role_id:
            return error_response("job_role_id is required", 400)

        conn = get_db()
        try:
            with conn.cursor() as cur:
                # Fetch target job role
                cur.execute("SELECT * FROM job_roles WHERE id = %s", (job_role_id,))
                role = cur.fetchone()
                if not role:
                    return error_response("Job role not found", 404)

                required_skills_raw = [
                    s.strip() for s in role.get('required_skills', '').split(',') if s.strip()
                ]

                # Fetch all user skills from user_skills table and users profile if logged in
                db_skills = []
                profile_skills = []
                if user_id:
                    cur.execute("SELECT skill_name FROM user_skills WHERE user_id = %s", (user_id,))
                    db_skills = [r['skill_name'].strip() for r in cur.fetchall()]

                    cur.execute("SELECT skills FROM users WHERE id = %s", (user_id,))
                    user_row = cur.fetchone()
                    if user_row and user_row.get('skills'):
                        profile_skills = [s.strip() for s in user_row['skills'].split(',') if s.strip()]

                all_user_skills = set([s.lower() for s in (db_skills + profile_skills)])

                matching_skills = []
                missing_skills = []

                for req in required_skills_raw:
                    # check case-insensitive match or substring
                    if req.lower() in all_user_skills or any(req.lower() in u for u in all_user_skills):
                        matching_skills.append(req)
                    else:
                        missing_skills.append(req)

                total_req = len(required_skills_raw)
                readiness_score = round((len(matching_skills) / total_req * 100), 1) if total_req > 0 else 0

                # Fetch recommendations for missing skills from learning_resources table
                recommendations = []
                for missing in missing_skills:
                    cur.execute(
                        """
                        SELECT * FROM learning_resources
                        WHERE LOWER(skill_name) = %s OR LOWER(skill_name) LIKE %s
                        LIMIT 3
                        """,
                        (missing.lower(), f"%{missing.lower()}%")
                    )
                    resources = cur.fetchall()
                    if resources:
                        for res in resources:
                            recommendations.append(dict(res))
                    else:
                        # Provide high quality default resource link if not in seed
                        recommendations.append({
                            "skill_name": missing,
                            "resource_title": f"Mastering {missing} - Complete Guide & Practice",
                            "resource_url": f"https://www.google.com/search?q={missing.replace(' ', '+')}+learning+roadmap+tutorial",
                            "resource_type": "tutorial",
                            "platform": "CareerBridge Learning Hub"
                        })

                # Save analysis result
                try:
                    cur.execute(
                        """
                        INSERT INTO skill_gap_results (user_id, job_role_id, missing_skills, recommendations)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (user_id, job_role_id, ', '.join(missing_skills), str(len(recommendations)))
                    )
                    conn.commit()
                except Exception:
                    pass

            return success_response(
                data={
                    "job_role": {
                        "id": role['id'],
                        "title": role['title'],
                        "description": role['description'],
                    },
                    "readiness_score": readiness_score,
                    "matching_skills": matching_skills,
                    "missing_skills": missing_skills,
                    "total_required": total_req,
                    "recommendations": recommendations
                },
                message=f"Analysis complete: {readiness_score}% ready for {role['title']}."
            )
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to analyze skill gap: {str(e)}", 500)


@skill_gap_bp.route('/learning-resources', methods=['GET'])
def get_learning_resources():
    """List or search learning resources."""
    try:
        skill = request.args.get('skill', '').strip()
        conn = get_db()
        try:
            with conn.cursor() as cur:
                if skill:
                    cur.execute(
                        "SELECT * FROM learning_resources WHERE LOWER(skill_name) LIKE %s ORDER BY id ASC",
                        (f"%{skill.lower()}%",)
                    )
                else:
                    cur.execute("SELECT * FROM learning_resources ORDER BY id ASC")
                res = cur.fetchall()

            return success_response(data={"resources": res, "count": len(res)})
        finally:
            conn.close()
    except Exception as e:
        return error_response(f"Failed to fetch resources: {str(e)}", 500)
