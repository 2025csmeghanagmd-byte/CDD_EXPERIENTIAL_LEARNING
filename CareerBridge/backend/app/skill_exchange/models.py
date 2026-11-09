
from app.extensions import db
from datetime import datetime


class SkillOffer(db.Model):
    __tablename__ = "skill_offers"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, nullable=False)
    skill_name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text)
    mode = db.Column(db.String(20), default="Free")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class InterviewProfile(db.Model):
    __tablename__ = "interview_profiles"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, nullable=False)
    interview_type = db.Column(db.String(100), nullable=False)
    skills = db.Column(db.String(255))
    experience_level = db.Column(db.String(50))
    availability = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PartnerRequest(db.Model):
    __tablename__ = "partner_requests"

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, nullable=False)
    receiver_id = db.Column(db.Integer, nullable=False)
    practice_type = db.Column(db.String(100), nullable=False)
    preferred_date = db.Column(db.Date, nullable=False)
    preferred_time = db.Column(db.String(30), nullable=False)
    campus_location = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text)
    status = db.Column(db.String(30), default="Pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PracticeSession(db.Model):
    __tablename__ = "practice_sessions"

    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(
        db.Integer,
        db.ForeignKey("partner_requests.id"),
        nullable=False
    )
    session_date = db.Column(db.Date, nullable=False)
    session_time = db.Column(db.String(30), nullable=False)
    campus_location = db.Column(db.String(150), nullable=False)
    status = db.Column(db.String(30), default="Scheduled")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
