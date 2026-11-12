from datetime import datetime, timezone, timedelta
from sqlalchemy import or_, desc, asc
from app.extensions import db
from app.internship.models import Internship, Application, Bookmark

def get_internships(filters=None, student_id=None, page=1, limit=9):
    """
    Retrieves filtered, searched, and paginated internships.
    """
    if filters is None:
        filters = {}

    query = Internship.query

    # Search filter (title, company_name, required_skills)
    search_query = filters.get("search", "").strip()
    if search_query:
        search_pattern = f"%{search_query}%"
        query = query.filter(
            or_(
                Internship.title.ilike(search_pattern),
                Internship.company_name.ilike(search_pattern),
                Internship.required_skills.ilike(search_pattern)
            )
        )

    # Location filter
    location = filters.get("location", "").strip()
    if location and location.lower() != "all":
        query = query.filter(Internship.location.ilike(f"%{location}%"))

    # Work Mode filter (Remote, Hybrid, On-site)
    work_mode = filters.get("work_mode", "").strip()
    if work_mode and work_mode.lower() != "all":
        query = query.filter(Internship.work_mode.ilike(work_mode))

    # Paid / Unpaid filter
    is_paid = filters.get("is_paid")
    if is_paid is not None:
        if str(is_paid).lower() in ["true", "1", "yes"]:
            query = query.filter(Internship.is_paid == True)
        elif str(is_paid).lower() in ["false", "0", "no"]:
            query = query.filter(Internship.is_paid == False)

    # Sorting
    sort_by = filters.get("sort_by", "latest")
    if sort_by == "deadline":
        query = query.order_by(asc(Internship.application_deadline))
    elif sort_by == "oldest":
        query = query.order_by(asc(Internship.created_at))
    else:  # default 'latest'
        query = query.order_by(desc(Internship.created_at))

    # Pagination
    total_count = query.count()
    limit = max(1, min(limit, 100))
    page = max(1, page)
    total_pages = max(1, (total_count + limit - 1) // limit)
    
    items = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "internships": [item.to_dict(student_id=student_id) for item in items],
        "pagination": {
            "page": page,
            "limit": limit,
            "total_items": total_count,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }


def get_internship_by_id(internship_id, student_id=None):
    """Fetches a single internship by its primary key."""
    internship = db.session.get(Internship, internship_id)
    if not internship:
        return None
    return internship.to_dict(student_id=student_id)


def apply_for_internship(student_id, data):
    """
    Submits a new application for a student.
    Prevents duplicate submissions and ensures internship exists.
    """
    internship_id = data["internship_id"]
    internship = db.session.get(Internship, internship_id)
    if not internship:
        return False, {"error": "Internship not found", "status_code": 404}

    # Verify deadline
    current_time = datetime.now(timezone.utc)
    # Convert deadline to timezone-aware if naive
    deadline = internship.application_deadline
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    if deadline < current_time:
        return False, {"error": "Application deadline has already passed for this internship.", "status_code": 400}

    # Check for existing application
    existing_app = Application.query.filter_by(
        internship_id=internship_id,
        student_id=student_id
    ).first()
    if existing_app:
        return False, {
            "error": "You have already applied for this internship.",
            "application_id": existing_app.id,
            "status": existing_app.status,
            "status_code": 409
        }

    new_app = Application(
        internship_id=internship_id,
        student_id=student_id,
        resume_url=data["resume_url"],
        cover_letter=data.get("cover_letter", ""),
        relevant_skills=data.get("relevant_skills", ""),
        status="Applied"
    )

    try:
        db.session.add(new_app)
        db.session.commit()
        return True, new_app.to_dict(include_internship=True)
    except Exception as e:
        db.session.rollback()
        return False, {"error": f"Database error during application: {str(e)}", "status_code": 500}


def get_student_applications(student_id, status_filter=None):
    """
    Retrieves all applications submitted by the given student.
    """
    query = Application.query.filter_by(student_id=student_id)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Application.status.ilike(status_filter))

    applications = query.order_by(desc(Application.applied_at)).all()
    return [app.to_dict(include_internship=True) for app in applications]


def get_application_by_id(application_id, student_id, is_admin=False):
    """
    Retrieves a single application, enforcing student ownership unless caller is an admin.
    """
    application = db.session.get(Application, application_id)
    if not application:
        return False, {"error": "Application not found", "status_code": 404}

    if not is_admin and application.student_id != student_id:
        return False, {"error": "Unauthorized access to application", "status_code": 403}

    return True, application.to_dict(include_internship=True)


def update_application_status(application_id, new_status, user_role="admin"):
    """
    Updates the status of an application. Only authorized roles (admin/staff/recruiter) may call this.
    """
    allowed_roles = ["admin", "staff", "recruiter"]
    if user_role not in allowed_roles:
        return False, {"error": "Students are not permitted to change application status.", "status_code": 403}

    application = db.session.get(Application, application_id)
    if not application:
        return False, {"error": "Application not found", "status_code": 404}

    application.status = new_status
    try:
        db.session.commit()
        return True, application.to_dict(include_internship=True)
    except Exception as e:
        db.session.rollback()
        return False, {"error": f"Failed to update status: {str(e)}", "status_code": 500}


def toggle_bookmark(student_id, internship_id):
    """
    Adds a bookmark for a student on an internship. Idempotent if already bookmarked.
    """
    internship = db.session.get(Internship, internship_id)
    if not internship:
        return False, {"error": "Internship not found", "status_code": 404}

    existing = Bookmark.query.filter_by(internship_id=internship_id, student_id=student_id).first()
    if existing:
        return True, {
            "message": "Internship is already bookmarked.",
            "is_bookmarked": True,
            "bookmark_id": existing.id
        }

    new_bm = Bookmark(internship_id=internship_id, student_id=student_id)
    try:
        db.session.add(new_bm)
        db.session.commit()
        return True, {
            "message": "Internship bookmarked successfully.",
            "is_bookmarked": True,
            "bookmark_id": new_bm.id
        }
    except Exception as e:
        db.session.rollback()
        return False, {"error": f"Failed to save bookmark: {str(e)}", "status_code": 500}


def remove_bookmark(student_id, internship_id):
    """
    Removes a bookmark for a student on an internship.
    """
    existing = Bookmark.query.filter_by(internship_id=internship_id, student_id=student_id).first()
    if not existing:
        return False, {"error": "Bookmark not found for this internship.", "status_code": 404}

    try:
        db.session.delete(existing)
        db.session.commit()
        return True, {
            "message": "Bookmark removed successfully.",
            "is_bookmarked": False
        }
    except Exception as e:
        db.session.rollback()
        return False, {"error": f"Failed to remove bookmark: {str(e)}", "status_code": 500}


def get_student_bookmarks(student_id):
    """
    Retrieves all bookmarked internships for the student.
    """
    bookmarks = Bookmark.query.filter_by(student_id=student_id).order_by(desc(Bookmark.created_at)).all()
    return [bm.to_dict(include_internship=True) for bm in bookmarks]


def get_internship_statistics(student_id):
    """
    Returns summary statistics for the student dashboard.
    """
    total_internships = Internship.query.count()
    applied_count = Application.query.filter_by(student_id=student_id).count()
    shortlisted_count = Application.query.filter_by(student_id=student_id, status="Shortlisted").count()
    selected_count = Application.query.filter_by(student_id=student_id, status="Selected").count()
    saved_count = Bookmark.query.filter_by(student_id=student_id).count()

    return {
        "total_available_internships": total_internships,
        "total_applications": applied_count,
        "shortlisted_applications": shortlisted_count,
        "selected_applications": selected_count,
        "saved_internships": saved_count
    }


def seed_sample_internships():
    """
    Seeds rich sample internship records if database is empty or requested.
    """
    if Internship.query.count() > 0:
        return False, "Database already contains internship records."

    now = datetime.now(timezone.utc)
    sample_records = [
        {
            "title": "Frontend Engineer Intern (React / TypeScript)",
            "company_name": "Razorpay Payments",
            "location": "Bengaluru, Karnataka",
            "work_mode": "Hybrid",
            "description": "Join Razorpay's Merchant Experience UI team to build high-performance checkout flows and payment dashboards. You will collaborate with senior UX designers and full-stack engineers to ship customer-facing React components used by millions of Indian merchants daily.",
            "eligibility": "B.Tech/BE in CSE, IT or related branches. 3rd or 4th year students with minimum 7.5 CGPA. Prior hands-on experience with React, HTML5, and CSS3.",
            "responsibilities": "Develop modular React components; Optimize bundle sizes and load performance; Write unit tests using Jest and React Testing Library; Integrate secure REST APIs.",
            "required_skills": "React, JavaScript, TypeScript, Tailwind CSS, REST APIs, Git",
            "stipend": "₹35,000 / month",
            "duration": "6 Months",
            "application_deadline": now + timedelta(days=25),
            "is_paid": True
        },
        {
            "title": "Backend Python / Flask Developer Intern",
            "company_name": "Swiggy Labs",
            "location": "Bengaluru, Karnataka",
            "work_mode": "Remote",
            "description": "Swiggy Labs is seeking an energetic Python / Flask intern to work on microservices powering high-throughput order routing and delivery optimization pipelines. You will design clean REST endpoints, write database migrations, and benchmark SQL queries.",
            "eligibility": "Open to pre-final and final year undergraduate/postgraduate students. Solid grasp of Python, relational databases, and data structures.",
            "responsibilities": "Design and document RESTful JSON APIs; Implement database indexing and SQLAlchemy ORM models; Implement rate-limiting and JWT auth middleware; Coordinate with QA teams.",
            "required_skills": "Python, Flask, MySQL, SQLAlchemy, Docker, Redis",
            "stipend": "₹40,000 / month",
            "duration": "6 Months",
            "application_deadline": now + timedelta(days=18),
            "is_paid": True
        },
        {
            "title": "Full Stack Web Developer Intern",
            "company_name": "Zoho Corporation",
            "location": "Chennai, Tamil Nadu",
            "work_mode": "On-site",
            "description": "Work inside Zoho's product core teams building SaaS productivity tools. You will handle end-to-end full stack development from responsive browser interfaces to backend database architecture.",
            "eligibility": "Graduating batch of 2026 or 2027. Strong fundamental programming knowledge in JavaScript and backend languages. Problem solving acumen.",
            "responsibilities": "Write clean, reusable code across client and server layers; Create scalable database schemas; Participate in daily sprint standups and code reviews.",
            "required_skills": "JavaScript, React, Python, PostgreSQL, REST APIs, Git",
            "stipend": "₹28,000 / month",
            "duration": "3 Months",
            "application_deadline": now + timedelta(days=12),
            "is_paid": True
        },
        {
            "title": "Cloud Infrastructure & DevOps Intern",
            "company_name": "Infosys InStep",
            "location": "Hyderabad, Telangana",
            "work_mode": "Hybrid",
            "description": "Gain hands-on industry exposure to continuous integration, cloud provisioning, containerized deployments, and automated testing pipelines across enterprise cloud clients.",
            "eligibility": "B.Tech/B.E. in CS/IT/ECE. Basic understanding of Linux terminal, Docker containers, and cloud fundamentals (AWS/Azure/GCP).",
            "responsibilities": "Help maintain CI/CD GitHub Action workflows; Containerize microservices using Docker; Monitor server logs and write health check scripts.",
            "required_skills": "Docker, Linux, Bash, Git, AWS, CI/CD",
            "stipend": "₹22,000 / month",
            "duration": "6 Months",
            "application_deadline": now + timedelta(days=30),
            "is_paid": True
        },
        {
            "title": "Machine Learning & Data Science Intern",
            "company_name": "Flipkart Data Labs",
            "location": "Bengaluru, Karnataka",
            "work_mode": "Remote",
            "description": "Collaborate with data scientists to research and prototype customer review sentiment classifiers, recommendation algorithms, and catalog deduplication pipelines.",
            "eligibility": "Proficiency in Python and numerical libraries (Pandas, NumPy, Scikit-learn). Basic understanding of statistics and SQL data extraction.",
            "responsibilities": "Preprocess and sanitize large-scale e-commerce datasets; Train baseline machine learning models; Expose prediction endpoints via Flask REST APIs.",
            "required_skills": "Python, Pandas, NumPy, Scikit-learn, SQL, Flask",
            "stipend": "₹45,000 / month",
            "duration": "4 Months",
            "application_deadline": now + timedelta(days=20),
            "is_paid": True
        },
        {
            "title": "Campus Tech Ambassador & Community Intern",
            "company_name": "OpenSource Foundation India",
            "location": "Pan India",
            "work_mode": "Remote",
            "description": "Lead student developer community meetups, coordinate open-source documentation hackathons, and help college juniors contribute their first pull request.",
            "eligibility": "Passionate communicator with active GitHub profile and keen enthusiasm for student developer communities.",
            "responsibilities": "Organize weekly virtual technical workshops; Author beginner-friendly documentation and tutorials; Coordinate campus ambassador outreach.",
            "required_skills": "Technical Writing, Git, GitHub, Public Speaking, Markdown",
            "stipend": "Unpaid (Certificate + Mentorship)",
            "duration": "2 Months",
            "application_deadline": now + timedelta(days=15),
            "is_paid": False
        },
        {
            "title": "UI/UX Product Design Intern",
            "company_name": "CRED Experiences",
            "location": "Bengaluru, Karnataka",
            "work_mode": "On-site",
            "description": "Craft pixel-perfect visual design systems, micro-interactions, wireframes, and high-fidelity Figma prototypes for premium fintech web and mobile user interfaces.",
            "eligibility": "Portfolio link mandatory (Behance, Dribbble, or Figma). Strong understanding of typography, contrast ratios, and modern UX design heuristics.",
            "responsibilities": "Design user flows and responsive prototypes; Collaborate closely with frontend React engineers; Conduct usability interviews with test users.",
            "required_skills": "Figma, Wireframing, Prototyping, Design Systems, UX Research",
            "stipend": "₹30,000 / month",
            "duration": "3 Months",
            "application_deadline": now + timedelta(days=14),
            "is_paid": True
        },
        {
            "title": "Cybersecurity & Vulnerability Assessment Intern",
            "company_name": "TCS Cyber Defense",
            "location": "Pune, Maharashtra",
            "work_mode": "Hybrid",
            "description": "Join the offensive security team to conduct OWASP Top 10 web application assessments, automated network scanning, and penetration testing on staged environments.",
            "eligibility": "Foundational knowledge of computer networks (TCP/IP), HTTP methods, Burp Suite, and secure coding practices.",
            "responsibilities": "Perform vulnerability scans on staging web apps; Draft vulnerability reports with remediation advice; Verify authentication and authorization flaws.",
            "required_skills": "OWASP, Burp Suite, Linux, Python, Networking, Penetration Testing",
            "stipend": "₹25,000 / month",
            "duration": "6 Months",
            "application_deadline": now + timedelta(days=28),
            "is_paid": True
        }
    ]

    for item in sample_records:
        internship = Internship(**item)
        db.session.add(internship)

    db.session.commit()
    return True, f"Successfully seeded {len(sample_records)} sample internships."

