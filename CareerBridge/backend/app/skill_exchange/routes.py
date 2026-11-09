
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.skill_exchange.models import (
    SkillOffer,
    InterviewProfile,
    PartnerRequest,
    PracticeSession
)

skill_exchange_bp = Blueprint(
    "skill_exchange",
    __name__,
    url_prefix="/api/exchange"
)


def response(data=None, message="Success", status=200):
    return jsonify({
        "success": True,
        "message": message,
        "data": data
    }), status


def error(message, status=400):
    return jsonify({
        "success": False,
        "message": message
    }), status


# 1. VIEW ALL SKILL OFFERS
@skill_exchange_bp.get("/skills")
def get_skills():
    offers = SkillOffer.query.order_by(
        SkillOffer.created_at.desc()
    ).all()

    data = [{
        "id": o.id,
        "student_id": o.student_id,
        "skill_name": o.skill_name,
        "category": o.category,
        "description": o.description,
        "mode": o.mode
    } for o in offers]

    return response(data)


# 2. ADD A SKILL OFFER
@skill_exchange_bp.post("/skills")
def add_skill():
    data = request.get_json(silent=True) or {}

    required = ["student_id", "skill_name", "category"]

    if any(not data.get(field) for field in required):
        return error("Student ID, skill name and category are required.")

    offer = SkillOffer(
        student_id=data["student_id"],
        skill_name=data["skill_name"],
        category=data["category"],
        description=data.get("description", ""),
        mode=data.get("mode", "Free")
    )

    db.session.add(offer)
    db.session.commit()

    return response({"id": offer.id}, "Skill offer created.", 201)


# 3. CREATE OR UPDATE INTERVIEW PROFILE
@skill_exchange_bp.post("/partners")
def create_interview_profile():
    data = request.get_json(silent=True) or {}

    required = ["student_id", "interview_type"]

    if any(not data.get(field) for field in required):
        return error("Student ID and interview type are required.")

    profile = InterviewProfile.query.filter_by(
        student_id=data["student_id"]
    ).first()

    if profile is None:
        profile = InterviewProfile(
            student_id=data["student_id"],
            interview_type=data["interview_type"]
        )
        db.session.add(profile)

    profile.interview_type = data["interview_type"]
    profile.skills = data.get("skills", "")
    profile.experience_level = data.get("experience_level", "")
    profile.availability = data.get("availability", "")

    db.session.commit()

    return response(
        {"id": profile.id},
        "Interview profile saved.",
        201
    )


# 4. FIND INTERVIEW PARTNERS
@skill_exchange_bp.get("/partners")
def get_partners():
    student_id = request.args.get("student_id", type=int)

    query = InterviewProfile.query

    if student_id:
        query = query.filter(
            InterviewProfile.student_id != student_id
        )

    profiles = query.all()

    data = [{
        "id": p.id,
        "student_id": p.student_id,
        "interview_type": p.interview_type,
        "skills": p.skills,
        "experience_level": p.experience_level,
        "availability": p.availability
    } for p in profiles]

    return response(data)


# 5. SEND A PARTNER REQUEST
@skill_exchange_bp.post("/requests")
def send_partner_request():
    data = request.get_json(silent=True) or {}

    required = [
        "sender_id",
        "receiver_id",
        "practice_type",
        "preferred_date",
        "preferred_time",
        "campus_location"
    ]

    if any(not data.get(field) for field in required):
        return error("Please complete all required request fields.")

    if data["sender_id"] == data["receiver_id"]:
        return error("You cannot send a request to yourself.")

    try:
        practice_date = datetime.strptime(
            data["preferred_date"], "%Y-%m-%d"
        ).date()
    except ValueError:
        return error("Date must be in YYYY-MM-DD format.")

    if practice_date < datetime.today().date():
        return error("Please select a future date.")

    partner_request = PartnerRequest(
        sender_id=data["sender_id"],
        receiver_id=data["receiver_id"],
        practice_type=data["practice_type"],
        preferred_date=practice_date,
        preferred_time=data["preferred_time"],
        campus_location=data["campus_location"],
        message=data.get("message", "")
    )

    db.session.add(partner_request)
    db.session.commit()

    return response(
        {"id": partner_request.id},
        "Practice request sent.",
        201
    )


# 6. VIEW SENT OR RECEIVED REQUESTS
@skill_exchange_bp.get("/requests")
def get_requests():
    student_id = request.args.get("student_id", type=int)

    if not student_id:
        return error("Student ID is required.")

    requests = PartnerRequest.query.filter(
        db.or_(
            PartnerRequest.sender_id == student_id,
            PartnerRequest.receiver_id == student_id
        )
    ).order_by(PartnerRequest.created_at.desc()).all()

    data = [{
        "id": r.id,
        "sender_id": r.sender_id,
        "receiver_id": r.receiver_id,
        "practice_type": r.practice_type,
        "preferred_date": r.preferred_date.isoformat(),
        "preferred_time": r.preferred_time,
        "campus_location": r.campus_location,
        "message": r.message,
        "status": r.status
    } for r in requests]

    return response(data)


# 7. ACCEPT OR REJECT A REQUEST
@skill_exchange_bp.put("/requests/<int:request_id>")
def update_request(request_id):
    data = request.get_json(silent=True) or {}

    partner_request = db.session.get(
        PartnerRequest, request_id
    )

    if partner_request is None:
        return error("Request not found.", 404)

    if data.get("receiver_id") != partner_request.receiver_id:
        return error("Only the receiving student can respond.", 403)

    status = data.get("status")

    if status not in ["Accepted", "Rejected"]:
        return error("Status must be Accepted or Rejected.")

    if partner_request.status != "Pending":
        return error("This request has already been processed.")

    partner_request.status = status

    if status == "Accepted":
        session = PracticeSession(
            request_id=partner_request.id,
            session_date=partner_request.preferred_date,
            session_time=partner_request.preferred_time,
            campus_location=partner_request.campus_location
        )
        db.session.add(session)

    db.session.commit()

    return response(
        {"status": partner_request.status},
        f"Request {status.lower()} successfully."
    )


# 8. VIEW PRACTICE SESSIONS
@skill_exchange_bp.get("/sessions")
def get_sessions():
    student_id = request.args.get("student_id", type=int)

    if not student_id:
        return error("Student ID is required.")

    sessions = PracticeSession.query.join(
        PartnerRequest
    ).filter(
        db.or_(
            PartnerRequest.sender_id == student_id,
            PartnerRequest.receiver_id == student_id
        )
    ).all()

    data = [{
        "id": s.id,
        "request_id": s.request_id,
        "session_date": s.session_date.isoformat(),
        "session_time": s.session_time,
        "campus_location": s.campus_location,
        "status": s.status
    } for s in sessions]

    return response(data)
