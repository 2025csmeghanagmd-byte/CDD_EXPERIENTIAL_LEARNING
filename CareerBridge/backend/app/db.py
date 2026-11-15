"""
CareerBridge - Database Connection & Fallback Manager
Provides seamless PyMySQL connection with automated SQLite fallback
so the application can run in all environments (local, Docker, or development).
"""

import os
import sqlite3
import pymysql

DB_FILE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'database', 'careerbridge.db')
)

class SQLiteCursorWrapper:
    def __init__(self, cursor):
        self._cursor = cursor

    def execute(self, query, params=None):
        # Convert MySQL placeholders %s to SQLite ?
        clean_query = query.replace('%s', '?')
        # Handle MySQL specific syntax if encountered
        clean_query = clean_query.replace('NOW()', 'CURRENT_TIMESTAMP')
        if params is None:
            return self._cursor.execute(clean_query)
        return self._cursor.execute(clean_query, tuple(params))

    def fetchone(self):
        row = self._cursor.fetchone()
        return dict(row) if row is not None else None

    def fetchall(self):
        rows = self._cursor.fetchall()
        return [dict(r) for r in rows]

    @property
    def lastrowid(self):
        return self._cursor.lastrowid

    @property
    def rowcount(self):
        return self._cursor.rowcount

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            self._cursor.close()
        except Exception:
            pass


class SQLiteConnectionWrapper:
    def __init__(self, conn):
        self._conn = conn

    def cursor(self):
        return SQLiteCursorWrapper(self._conn.cursor())

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()


def _init_sqlite_db(conn):
    """Initialize tables and seeds in SQLite if empty."""
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        phone TEXT,
        college TEXT,
        department TEXT,
        year TEXT,
        bio TEXT,
        skills TEXT,
        linkedin TEXT,
        github TEXT,
        profile_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS internships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        description TEXT,
        location TEXT,
        type TEXT DEFAULT 'remote',
        duration TEXT,
        stipend TEXT,
        skills_required TEXT,
        deadline DATE,
        posted_by INTEGER,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        internship_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        cover_letter TEXT,
        resume_url TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        internship_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        option_a TEXT,
        option_b TEXT,
        option_c TEXT,
        option_d TEXT,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        difficulty TEXT DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS mock_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        category_id INTEGER,
        duration_minutes INTEGER DEFAULT 30,
        total_questions INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS test_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        test_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        time_taken INTEGER,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS job_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        required_skills TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        skill_name TEXT NOT NULL,
        proficiency TEXT DEFAULT 'beginner',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS skill_gap_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        job_role_id INTEGER NOT NULL,
        missing_skills TEXT,
        recommendations TEXT,
        analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS learning_resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill_name TEXT NOT NULL,
        resource_title TEXT NOT NULL,
        resource_url TEXT,
        resource_type TEXT DEFAULT 'course',
        platform TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS skill_listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        skill_name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        is_paid INTEGER DEFAULT 0,
        price REAL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS exchange_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id INTEGER NOT NULL,
        requester_id INTEGER NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reviewer_id INTEGER NOT NULL,
        reviewed_user_id INTEGER NOT NULL,
        listing_id INTEGER,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Seed Sample Users if empty
    cur.execute("SELECT COUNT(*) as cnt FROM users")
    if cur.fetchone()[0] == 0:
        cur.execute("""
        INSERT INTO users (id, name, email, password, role, phone, college, department, year, bio, skills, linkedin, github) VALUES
        (1, 'Alex Johnson', 'student@careerbridge.com', '$2b$12$IA4dstge0TwfJN.UnlqkVeGbZFaJDn0bAzLboA9NIbNEmaRGvmjOW', 'student', '+91 9876543210', 'Indian Institute of Technology', 'Computer Science and Engineering', '3rd Year', 'Passionate full-stack developer eager to learn cloud, microservices, and DevOps.', 'React, JavaScript, Python, Flask, MySQL, Git, Docker', 'https://linkedin.com/in/alexjohnson', 'https://github.com/alexjohnson'),
        (2, 'Sarah Connor', 'admin@careerbridge.com', '$2b$12$lDK5JNKR.EQqZnw9.bM3ou7MSmiobUBkc0FyJDrMocYlOFQ7pqpoS', 'admin', '+91 9876543211', 'CareerBridge University', 'Administration', 'Staff', 'Platform Administrator and Career Guidance Coordinator.', 'Mentorship, Career Guidance, Platform Management', 'https://linkedin.com/in/sarahconnor', 'https://github.com/sarahconnor'),
        (3, 'TechCorp Recruiter', 'recruiter@careerbridge.com', '$2b$12$IA4dstge0TwfJN.UnlqkVeGbZFaJDn0bAzLboA9NIbNEmaRGvmjOW', 'employer', '+91 9876543212', 'TechCorp Talent Team', 'Human Resources', 'Professional', 'Hiring top tier student talent for software engineering internships.', 'Talent Acquisition, Technical Interviewing, Engineering Recruitment', 'https://linkedin.com/company/techcorp', '')
        """)

        cur.execute("""
        INSERT INTO internships (title, company, description, location, type, duration, stipend, skills_required, deadline, posted_by) VALUES
        ('Frontend Developer Intern', 'TechCorp', 'Build modern web interfaces using React.js and REST APIs.', 'Bangalore', 'hybrid', '3 months', '15000', 'HTML,CSS,JavaScript,React', '2027-03-01', 3),
        ('Backend Developer Intern', 'DataSoft', 'Develop REST APIs and database queries using Python Flask and MySQL.', 'Remote', 'remote', '6 months', '20000', 'Python,Flask,MySQL,REST API', '2027-04-01', 3),
        ('Data Science & AI Intern', 'AnalyticsPro', 'Work on ML models, predictive analytics, data cleaning, and statistical reporting.', 'Hyderabad', 'onsite', '4 months', '25000', 'Python,Pandas,NumPy,Machine Learning,TensorFlow', '2027-02-15', 3),
        ('Mobile App Developer', 'AppWorks', 'Build cross-platform mobile apps using React Native.', 'Mumbai', 'hybrid', '3 months', '18000', 'React Native,JavaScript,Firebase', '2027-03-15', 3),
        ('Cloud & DevOps Intern', 'CloudNine', 'Build CI/CD pipelines, containerize apps with Docker, and manage cloud infrastructure.', 'Remote', 'remote', '6 months', '22000', 'Docker,Kubernetes,AWS,Linux,Git', '2027-05-01', 3),
        ('Mechanical CAD & Simulation Intern', 'Tesla/AeroDrive', 'Perform 3D CAD modeling, FEA stress analysis, and thermal simulation for automotive components.', 'Pune', 'onsite', '6 months', '24000', 'SolidWorks,AutoCAD,ANSYS,GD&T,FEA', '2027-04-15', 3),
        ('Embedded Systems & IoT Intern', 'Bosch Technologies', 'Develop firmware on ARM Cortex-M microcontrollers, RTOS tasks, and sensor integrations.', 'Bangalore', 'hybrid', '4 months', '21000', 'C,C++,ARM,RTOS,Microcontrollers,I2C,SPI', '2027-03-30', 3),
        ('UI/UX Product Design Intern', 'DesignCraft Studio', 'Design end-to-end user journeys, high-fidelity prototypes, and design systems for web and mobile.', 'Remote', 'remote', '3 months', '18000', 'Figma,User Research,Wireframing,Prototyping,Design Systems', '2027-04-01', 3),
        ('Financial Analyst Intern', 'Goldman Sachs & Co', 'Assist in financial modeling, company valuation, cash flow analysis, and market research.', 'Mumbai', 'hybrid', '3 months', '30000', 'Financial Modeling,Excel,Valuation,Accounting,PowerBI', '2027-03-20', 3),
        ('Civil & Structural Engineering Intern', 'L&T Infrastructure', 'Structural analysis, blueprint drafting, site survey, and concrete testing for urban transit projects.', 'Delhi NCR', 'onsite', '6 months', '20000', 'AutoCAD,STAAD Pro,Structural Analysis,Surveying,Estimation', '2027-05-10', 3);
        """)

        cur.execute("""
        INSERT INTO applications (user_id, internship_id, status, cover_letter) VALUES
        (1, 1, 'pending', 'I have hands-on experience building React SPAs with responsive design.'),
        (1, 2, 'accepted', 'I love working with Flask and relational databases like MySQL.');
        """)

        cur.execute("""
        INSERT INTO categories (name, type, description) VALUES
        ('Arrays & Strings', 'dsa', 'Problems on arrays, strings, two pointers, and sliding window'),
        ('Linked Lists & Trees', 'dsa', 'Singly, doubly linked lists and binary tree traversals'),
        ('Quantitative Aptitude', 'aptitude', 'Number systems, percentages, ratios, profit and loss'),
        ('Logical Reasoning', 'aptitude', 'Puzzles, sequences, direction sense, and syllogisms'),
        ('Technical - Software & CS', 'interview', 'Core CS questions on OOP, DBMS, OS, and System Design'),
        ('Technical - Mechanical Engineering', 'interview', 'Thermodynamics, Strength of Materials, Fluid Mechanics & CAD'),
        ('Technical - Electronics & Embedded', 'interview', 'Digital logic, Microcontrollers, VLSI, and Circuit Theory'),
        ('Technical - Civil Engineering', 'interview', 'Structural Mechanics, Surveying, RCC Design & Geotech'),
        ('HR & Behavioral Interview', 'interview', 'Behavioral questions, STAR method, situational and leadership scenarios');
        """)

        cur.execute("""
        INSERT INTO questions (category_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
        (1, 'What is the average time complexity of searching in a balanced Binary Search Tree?', 'O(n)', 'O(log n)', 'O(n log n)', 'O(1)', 'B', 'A balanced BST divides the search space in half at each level, resulting in O(log n).', 'easy'),
        (1, 'Which data structure follows the Last In First Out (LIFO) principle?', 'Queue', 'Stack', 'Linked List', 'Binary Tree', 'B', 'A Stack follows the Last In First Out (LIFO) principle.', 'easy'),
        (3, 'If A is 20% more than B, then B is what percentage less than A?', '16.67%', '20%', '25%', '15%', 'A', 'If A = 1.2 * B, then B = A / 1.2 = 0.8333 * A. Difference is (1 - 0.8333) = 16.67%.', 'medium'),
        (4, 'Find the next number in the sequence: 2, 6, 12, 20, 30, ?', '40', '42', '36', '38', 'B', 'Differences are 4, 6, 8, 10, 12. Next term is 30 + 12 = 42.', 'medium'),
        (5, 'Which ACID property guarantees that all database operations in a transaction complete or none do?', 'Atomicity', 'Consistency', 'Isolation', 'Durability', 'A', 'Atomicity ensures that all transactions are treated as single all-or-nothing units.', 'easy'),
        (6, 'Which thermodynamic cycle represents the ideal theoretical benchmark for heat engines?', 'Otto cycle', 'Rankine cycle', 'Carnot cycle', 'Brayton cycle', 'C', 'The Carnot cycle is the maximum theoretical efficiency limit for heat engines operating between two temperatures.', 'medium'),
        (7, 'Which communication protocol uses two wires: SDA and SCL?', 'SPI', 'I2C', 'UART', 'CAN', 'B', 'I2C (Inter-Integrated Circuit) uses two bidirectional lines: Serial Data (SDA) and Serial Clock (SCL).', 'easy'),
        (8, 'In structural analysis, what does a bending moment at an inflection point equal?', 'Maximum', 'Minimum', 'Zero', 'Infinity', 'C', 'An inflection (or contraflexure) point is where the curvature changes sign and the bending moment is zero.', 'medium');
        """)

        cur.execute("""
        INSERT INTO mock_tests (title, description, category_id, duration_minutes, total_questions) VALUES
        ('All-Domain General Aptitude & Logic Assessment', 'General cognitive assessment covering quantitative reasoning and sequence logic.', 3, 20, 10),
        ('Software Engineering & Core CS Technical Mock', 'Assessment covering Algorithms, Data Structures, OOP, and Database concepts.', 5, 30, 15),
        ('Mechanical Core Engineering Placement Test', 'Mock test covering Strength of Materials, Thermodynamics, and Manufacturing.', 6, 25, 10),
        ('Electronics & Embedded Systems Mock Test', 'Test on digital logic, microcontroller architectures, and interface protocols.', 7, 25, 10);
        """)

        cur.execute("""
        INSERT INTO job_roles (title, description, required_skills) VALUES
        ('Frontend Developer', 'Build accessible, responsive user interfaces for modern web applications', 'HTML,CSS,JavaScript,React,TypeScript,Git,Responsive Design'),
        ('Backend Developer', 'Develop scalable server-side microservices, APIs, and databases', 'Python,Java,Node.js,SQL,REST API,Git,Docker'),
        ('Full Stack Developer', 'End-to-end web application development from UI to cloud infrastructure', 'HTML,CSS,JavaScript,React,Node.js,Python,SQL,Git,Docker,REST API'),
        ('Data Scientist & ML Engineer', 'Analyze multi-variable data and build predictive machine learning models', 'Python,Pandas,NumPy,Scikit-learn,TensorFlow,SQL,Statistics,Machine Learning'),
        ('DevOps & Cloud Engineer', 'Manage automated CI/CD pipelines, container orchestration, and cloud infrastructure', 'Docker,Kubernetes,AWS,Linux,Git,CI/CD,Terraform,Python'),
        ('Mechanical Design Engineer', 'Develop mechanical products, CAD assemblies, and FEA stress simulations', 'SolidWorks,AutoCAD,ANSYS,GD&T,FEA,Thermodynamics,Manufacturing Processes'),
        ('Embedded Systems & IoT Engineer', 'Program firmware, microcontrollers, real-time operating systems, and hardware interfaces', 'C,C++,ARM,RTOS,Microcontrollers,I2C,SPI,PCB Design'),
        ('UI/UX & Product Designer', 'Design intuitive user experiences, wireframes, prototypes, and design systems', 'Figma,User Research,Wireframing,Prototyping,Design Systems,Information Architecture'),
        ('Financial Analyst', 'Perform corporate financial modeling, investment valuation, and cash flow analysis', 'Financial Modeling,Excel,Valuation,Accounting,PowerBI,Financial Reporting'),
        ('Civil & Structural Engineer', 'Design, analyze, and inspect structural frameworks, foundations, and urban buildings', 'AutoCAD,STAAD Pro,Structural Analysis,Surveying,Estimation,Concrete Technology');
        """)

        cur.execute("""
        INSERT INTO learning_resources (skill_name, resource_title, resource_url, resource_type, platform) VALUES
        ('React', 'Official React Documentation & Interactive Tutorial', 'https://react.dev/learn', 'tutorial', 'React.dev'),
        ('Python', 'Python for Everybody Specialization', 'https://www.py4e.com/', 'course', 'Coursera'),
        ('JavaScript', 'The Modern JavaScript Tutorial - From Basics to Advanced', 'https://javascript.info/', 'tutorial', 'JavaScript.info'),
        ('SQL', 'Complete Relational SQL & Database Query Guide', 'https://www.w3schools.com/sql/', 'tutorial', 'W3Schools'),
        ('Docker', 'Docker Containerization Getting Started Handbook', 'https://docs.docker.com/get-started/', 'tutorial', 'Docker Docs'),
        ('SolidWorks', 'SolidWorks 3D CAD Essentials & Assemblies Tutorial', 'https://my.solidworks.com/training', 'course', 'Dassault Systèmes'),
        ('AutoCAD', 'Autodesk AutoCAD Learning Pathway & Certifications', 'https://www.autodesk.com/certification/learn', 'course', 'Autodesk'),
        ('Figma', 'Figma For Beginners: Complete UI/UX Masterclass', 'https://help.figma.com/hc/en-us/articles/360040328273', 'tutorial', 'Figma Academy'),
        ('Financial Modeling', 'Financial Modeling Fundamentals & Valuation Course', 'https://corporatefinanceinstitute.com/resources/financial-modeling/', 'article', 'CFI'),
        ('STAAD Pro', 'Bentley STAAD.Pro Structural Analysis Guide', 'https://www.bentley.com/software/staad/', 'tutorial', 'Bentley Learning'),
        ('ARM', 'ARM Architecture and Embedded Firmware Development', 'https://www.arm.com/resources/education', 'course', 'ARM Education');
        """)

        cur.execute("""
        INSERT INTO skill_listings (user_id, skill_name, description, type, is_paid, price, status) VALUES
        (1, 'React & Frontend Styling', 'Offering 1-on-1 tutoring on React Hooks, Tailwind CSS, and component design.', 'offer', 0, 0.00, 'active'),
        (1, 'Cloud & AWS Basics', 'Looking for a peer to guide me through AWS EC2, S3, and Docker deployment.', 'request', 0, 0.00, 'active'),
        (2, 'Resume Review & HR Interview Prep', 'Will conduct a 30-minute mock behavioral interview and review your CV.', 'offer', 0, 0.00, 'active'),
        (3, 'Mechanical CAD & SolidWorks', 'Offering hands-on guidance with 3D modeling and assembly mates.', 'offer', 0, 0.00, 'active');
        """)

    conn.commit()


def get_db_connection():
    """
    Attempts to connect to MySQL first.
    If MySQL server is unreachable, falls back to local SQLite database seamlessly.
    """
    try:
        connection = pymysql.connect(
            host=os.environ.get('MYSQL_HOST') or os.environ.get('DB_HOST', 'localhost'),
            port=int(os.environ.get('MYSQL_PORT') or os.environ.get('DB_PORT', 3306)),
            user=os.environ.get('MYSQL_USER') or os.environ.get('DB_USER', 'root'),
            password=os.environ.get('MYSQL_PASSWORD') or os.environ.get('DB_PASSWORD', ''),
            database=os.environ.get('MYSQL_DB') or os.environ.get('DB_NAME', 'careerbridge'),
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=2
        )
        return connection
    except Exception:
        # Fallback to local SQLite database
        os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
        sqlite_conn = sqlite3.connect(DB_FILE)
        sqlite_conn.row_factory = sqlite3.Row
        _init_sqlite_db(sqlite_conn)
        return SQLiteConnectionWrapper(sqlite_conn)

