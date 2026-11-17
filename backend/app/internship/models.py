from datetime import datetime, timezone
from app.extensions import db

class Internship(db.Model):
    """
    Internship model representing available internships posted on CareerBridge.
    Compatible with MySQL (InnoDB) and SQLite.
    """
    __tablename__ = "internships"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False, index=True)
    company_name = db.Column(db.String(255), nullable=False, index=True)
    location = db.Column(db.String(255), nullable=False, index=True)
    work_mode = db.Column(db.String(50), nullable=False, default="Remote", index=True)  # Remote, Hybrid, On-site
    description = db.Column(db.Text, nullable=False)
    eligibility = db.Column(db.Text, nullable=True)
    responsibilities = db.Column(db.Text, nullable=True)
    required_skills = db.Column(db.String(500), nullable=False, index=True)  # e.g. "React, JavaScript, Tailwind CSS"
    stipend = db.Column(db.String(100), nullable=False)  # e.g. "₹25,000 / month" or "Unpaid"
    duration = db.Column(db.String(100), nullable=False)  # e.g. "3 Months"
    application_deadline = db.Column(db.DateTime, nullable=False, index=True)
    is_paid = db.Column(db.Boolean, default=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    applications = db.relationship(
        "Application",
        back_populates="internship",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    bookmarks = db.relationship(
        "Bookmark",
        back_populates="internship",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )

    def to_dict(self, student_id=None):
        """Serializes internship to dictionary, with contextual student flags."""
        skills_list = [s.strip() for s in self.required_skills.split(",") if s.strip()] if self.required_skills else []
        
        # Check contextual bookmark / application status if student_id is provided
        is_bookmarked = False
        has_applied = False
        application_status = None
        application_id = None
        
        if student_id:
            bm = Bookmark.query.filter_by(internship_id=self.id, student_id=student_id).first()
            is_bookmarked = bm is not None
            
            app = Application.query.filter_by(internship_id=self.id, student_id=student_id).first()
            if app:
                has_applied = True
                application_status = app.status
                application_id = app.id

        return {
            "id": self.id,
            "title": self.title,
            "company_name": self.company_name,
            "location": self.location,
            "work_mode": self.work_mode,
            "description": self.description,
            "eligibility": self.eligibility,
            "responsibilities": self.responsibilities,
            "required_skills": self.required_skills,
            "skills_list": skills_list,
            "stipend": self.stipend,
            "duration": self.duration,
            "application_deadline": self.application_deadline.isoformat() if self.application_deadline else None,
            "is_paid": self.is_paid,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_bookmarked": is_bookmarked,
            "has_applied": has_applied,
            "application_status": application_status,
            "application_id": application_id,
            "total_applications": self.applications.count()
        }


class Application(db.Model):
    """
    Application model representing an application submitted by a student for an internship.
    Foreign key for student_id connects with Member 1's shared user/student table.
    """
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    internship_id = db.Column(
        db.Integer,
        db.ForeignKey("internships.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # student_id points to Member 1's shared users/student table (e.g. users.id).
    # Kept as Integer to align with Member 1's PK without hardcoded schema failure before Member 1 migration.
    student_id = db.Column(db.Integer, nullable=False, index=True)
    
    resume_url = db.Column(db.String(500), nullable=False)
    cover_letter = db.Column(db.Text, nullable=True)
    relevant_skills = db.Column(db.String(500), nullable=True)
    
    # Statuses: Applied, Under Review, Shortlisted, Rejected, Selected
    status = db.Column(db.String(50), default="Applied", nullable=False, index=True)
    applied_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Prevent duplicate applications by same student for the same internship
    __table_args__ = (
        db.UniqueConstraint("internship_id", "student_id", name="uq_internship_student_application"),
    )

    internship = db.relationship("Internship", back_populates="applications")

    VALID_STATUSES = ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"]

    def to_dict(self, include_internship=True):
        """Serializes application to dictionary."""
        data = {
            "id": self.id,
            "internship_id": self.internship_id,
            "student_id": self.student_id,
            "resume_url": self.resume_url,
            "cover_letter": self.cover_letter,
            "relevant_skills": self.relevant_skills,
            "status": self.status,
            "applied_at": self.applied_at.isoformat() if self.applied_at else None,
        }
        if include_internship and self.internship:
            data["internship"] = {
                "id": self.internship.id,
                "title": self.internship.title,
                "company_name": self.internship.company_name,
                "location": self.internship.location,
                "work_mode": self.internship.work_mode,
                "stipend": self.internship.stipend,
                "duration": self.internship.duration,
                "application_deadline": self.internship.application_deadline.isoformat() if self.internship.application_deadline else None,
                "is_paid": self.internship.is_paid,
            }
        return data


class Bookmark(db.Model):
    """
    Bookmark model allowing students to save internships to view or apply later.
    """
    __tablename__ = "bookmarks"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    internship_id = db.Column(
        db.Integer,
        db.ForeignKey("internships.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    student_id = db.Column(db.Integer, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Prevent duplicate bookmarks
    __table_args__ = (
        db.UniqueConstraint("internship_id", "student_id", name="uq_internship_student_bookmark"),
    )

    internship = db.relationship("Internship", back_populates="bookmarks")

    def to_dict(self, include_internship=True):
        """Serializes bookmark to dictionary."""
        data = {
            "id": self.id,
            "internship_id": self.internship_id,
            "student_id": self.student_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_internship and self.internship:
            data["internship"] = self.internship.to_dict(student_id=self.student_id)
        return data

