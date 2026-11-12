"""
CareerBridge - Standalone Database Seeder Script (Member 2)
Seeds rich, realistic internships, applications, and bookmarks across multiple students.
Run with: python seed.py [--reset]
"""

import sys
import os
from datetime import datetime, timezone, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from app.extensions import db
from app.internship.models import Internship, Application, Bookmark
from app.internship.services import seed_sample_internships

def run_seed(reset=False):
    app = create_app(os.getenv("FLASK_ENV", "development"))
    with app.app_context():
        if reset:
            print("⚠️  Resetting database tables...")
            db.drop_all()
            db.create_all()
            print("✓ Database tables recreated.")

        print("🌱 Seeding internship opportunities...")
        success, msg = seed_sample_internships()
        print(f"  → {msg}")

        now = datetime.now(timezone.utc)

        # Pre-seed applications for Student 1 (Alex Johnson)
        # Demonstrating: Under Review, Shortlisted, Selected
        student_1_id = 1
        app1_check = Application.query.filter_by(student_id=student_1_id, internship_id=1).first()
        if not app1_check:
            a1 = Application(
                internship_id=1,
                student_id=student_1_id,
                resume_url="https://drive.google.com/file/d/alex-johnson-resume-2026/view",
                cover_letter="I have built 4 full-stack React projects including CareerBridge. Proficient in React 18, Vite, and Tailwind CSS. Eager to contribute to merchant checkout flows.",
                relevant_skills="React, TypeScript, Tailwind CSS, REST APIs",
                status="Under Review",
                applied_at=now - timedelta(days=3)
            )
            a2 = Application(
                internship_id=2,
                student_id=student_1_id,
                resume_url="https://github.com/alex-johnson/portfolio",
                cover_letter="Experienced in Python microservices, SQLAlchemy ORM, and database optimization. Completed backend coursework with top grade.",
                relevant_skills="Python, Flask, MySQL, Docker",
                status="Shortlisted",
                applied_at=now - timedelta(days=6)
            )
            a3 = Application(
                internship_id=7,
                student_id=student_1_id,
                resume_url="https://drive.google.com/file/d/alex-design-portfolio/view",
                cover_letter="Passionate about clean user interfaces, typography, and human-computer interaction.",
                relevant_skills="Figma, UI Design, Wireframing",
                status="Selected",
                applied_at=now - timedelta(days=12)
            )
            db.session.add_all([a1, a2, a3])
            print("✓ Pre-seeded 3 demo applications for Student 1 (Under Review, Shortlisted, Selected)")

        # Pre-seed applications for Student 2 (Priya Sharma)
        # Demonstrating: Applied, Rejected
        student_2_id = 2
        app2_check = Application.query.filter_by(student_id=student_2_id, internship_id=2).first()
        if not app2_check:
            b1 = Application(
                internship_id=2,
                student_id=student_2_id,
                resume_url="https://linkedin.com/in/priya-sharma-ece",
                cover_letter="ECE senior with extensive backend Python experience. Built IoT data collection gateways.",
                relevant_skills="Python, Flask, Redis, Docker",
                status="Applied",
                applied_at=now - timedelta(days=1)
            )
            b2 = Application(
                internship_id=5,
                student_id=student_2_id,
                resume_url="https://drive.google.com/file/d/priya-ml-resume/view",
                cover_letter="Keen interest in data pipelines and machine learning classifiers.",
                relevant_skills="Python, Pandas, Scikit-learn",
                status="Rejected",
                applied_at=now - timedelta(days=9)
            )
            db.session.add_all([b1, b2])
            print("✓ Pre-seeded 2 demo applications for Student 2 (Applied, Rejected)")

        # Pre-seed bookmarks
        bm_check = Bookmark.query.filter_by(student_id=student_1_id, internship_id=3).first()
        if not bm_check:
            bm1 = Bookmark(internship_id=3, student_id=student_1_id)
            bm2 = Bookmark(internship_id=4, student_id=student_1_id)
            bm3 = Bookmark(internship_id=1, student_id=student_2_id)
            db.session.add_all([bm1, bm2, bm3])
            print("✓ Pre-seeded demo bookmarks for Student 1 and Student 2")

        db.session.commit()
        print("\n🎉 Database successfully seeded and ready for viva / demo presentation!")
        print(f"📊 Total Internships: {Internship.query.count()}")
        print(f"📄 Total Applications: {Application.query.count()}")
        print(f"🔖 Total Bookmarks: {Bookmark.query.count()}")

if __name__ == "__main__":
    do_reset = "--reset" in sys.argv
    run_seed(reset=do_reset)

