-- CareerBridge Database Schema
-- Campus Career Development Platform
-- Complete MySQL database schema with seed data for all 5 modules

CREATE DATABASE IF NOT EXISTS careerbridge;
USE careerbridge;

-- ============================================================
-- Member 1: Core tables (User Authentication & Profile)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin', 'recruiter', 'employer') DEFAULT 'student',
    phone VARCHAR(20),
    college VARCHAR(200),
    department VARCHAR(100),
    year VARCHAR(20),
    bio TEXT,
    skills TEXT,
    linkedin VARCHAR(255),
    github VARCHAR(255),
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- Member 2: Internship tables (Internship Listings & Applications)
-- ============================================================

CREATE TABLE IF NOT EXISTS internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    type ENUM('remote', 'onsite', 'hybrid') DEFAULT 'remote',
    duration VARCHAR(50),
    stipend VARCHAR(50),
    skills_required TEXT,
    deadline DATE,
    posted_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    internship_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    cover_letter TEXT,
    resume_url VARCHAR(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    internship_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bookmark (user_id, internship_id)
);

-- ============================================================
-- Member 3: Placement tables (Placement Preparation)
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('dsa', 'aptitude', 'interview', 'company') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_answer CHAR(1) NOT NULL,
    explanation TEXT,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mock_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INT,
    duration_minutes INT DEFAULT 30,
    total_questions INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS test_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    score INT NOT NULL,
    total INT NOT NULL,
    time_taken INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES mock_tests(id) ON DELETE CASCADE
);

-- ============================================================
-- Member 4: Skill Gap tables (Skill Gap Analyzer)
-- ============================================================

CREATE TABLE IF NOT EXISTS job_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    required_skills TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skill_gap_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_role_id INT NOT NULL,
    missing_skills TEXT,
    recommendations TEXT,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_role_id) REFERENCES job_roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS learning_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL,
    resource_title VARCHAR(200) NOT NULL,
    resource_url VARCHAR(500),
    resource_type ENUM('video', 'article', 'course', 'book', 'tutorial') DEFAULT 'course',
    platform VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Member 5: Skill Exchange tables (Skill Exchange Platform)
-- ============================================================

CREATE TABLE IF NOT EXISTS skill_listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('offer', 'request') NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2),
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exchange_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    requester_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES skill_listings(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id INT NOT NULL,
    reviewed_user_id INT NOT NULL,
    listing_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES skill_listings(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Seed Data
-- ============================================================

-- Member 1: Sample Users (Passwords: student123, admin123, student123)
INSERT INTO users (id, name, email, password, role, phone, college, department, year, bio, skills, linkedin, github) VALUES
(1, 'Alex Johnson', 'student@careerbridge.com', '$2b$12$IA4dstge0TwfJN.UnlqkVeGbZFaJDn0bAzLboA9NIbNEmaRGvmjOW', 'student', '+91 9876543210', 'Indian Institute of Technology', 'Computer Science and Engineering', '3rd Year', 'Passionate full-stack developer eager to learn cloud, microservices, and DevOps.', 'React, JavaScript, Python, Flask, MySQL, Git, Docker', 'https://linkedin.com/in/alexjohnson', 'https://github.com/alexjohnson'),
(2, 'Sarah Connor', 'admin@careerbridge.com', '$2b$12$lDK5JNKR.EQqZnw9.bM3ou7MSmiobUBkc0FyJDrMocYlOFQ7pqpoS', 'admin', '+91 9876543211', 'CareerBridge University', 'Administration', 'Staff', 'Platform Administrator and Career Guidance Coordinator.', 'Mentorship, Career Guidance, Platform Management', 'https://linkedin.com/in/sarahconnor', 'https://github.com/sarahconnor'),
(3, 'TechCorp Recruiter', 'recruiter@careerbridge.com', '$2b$12$IA4dstge0TwfJN.UnlqkVeGbZFaJDn0bAzLboA9NIbNEmaRGvmjOW', 'employer', '+91 9876543212', 'TechCorp Talent Team', 'Human Resources', 'Professional', 'Hiring top tier student talent for software engineering internships.', 'Talent Acquisition, Technical Interviewing, Engineering Recruitment', 'https://linkedin.com/company/techcorp', '')
ON DUPLICATE KEY UPDATE email=email;

-- Member 2: Sample Internships
INSERT INTO internships (title, company, description, location, type, duration, stipend, skills_required, deadline, posted_by) VALUES
('Frontend Developer Intern', 'TechCorp', 'Build modern web interfaces using React.js and REST APIs.', 'Bangalore', 'hybrid', '3 months', '15000', 'HTML,CSS,JavaScript,React', '2027-03-01', 3),
('Backend Developer Intern', 'DataSoft', 'Develop REST APIs and database queries using Python Flask and MySQL.', 'Remote', 'remote', '6 months', '20000', 'Python,Flask,MySQL,REST API', '2027-04-01', 3),
('Data Science Intern', 'AnalyticsPro', 'Work on ML models, data cleaning, and statistical reporting.', 'Hyderabad', 'onsite', '4 months', '25000', 'Python,Pandas,NumPy,Machine Learning', '2027-02-15', 3),
('Mobile App Developer', 'AppWorks', 'Build cross-platform mobile apps using React Native.', 'Mumbai', 'hybrid', '3 months', '18000', 'React Native,JavaScript,Firebase', '2027-03-15', 3),
('DevOps Intern', 'CloudNine', 'Build CI/CD pipelines, containerize apps with Docker, and cloud deployments.', 'Remote', 'remote', '6 months', '22000', 'Docker,Kubernetes,AWS,Linux,Git', '2027-05-01', 3);

-- Member 2: Sample Applications for Alex
INSERT INTO applications (user_id, internship_id, status, cover_letter) VALUES
(1, 1, 'pending', 'I have hands-on experience building React SPAs with responsive design.'),
(1, 2, 'accepted', 'I love working with Flask and relational databases like MySQL.');

-- Member 4: Job Roles for Skill Gap Analyzer
INSERT INTO job_roles (title, description, required_skills) VALUES
('Frontend Developer', 'Build user interfaces for modern web applications', 'HTML,CSS,JavaScript,React,TypeScript,Git,Responsive Design'),
('Backend Developer', 'Develop server-side applications, business logic, and databases', 'Python,Java,Node.js,SQL,REST API,Git,Docker'),
('Full Stack Developer', 'End-to-end web application development from UI to database', 'HTML,CSS,JavaScript,React,Node.js,Python,SQL,Git,Docker,REST API'),
('Data Scientist', 'Analyze complex data and build predictive machine learning models', 'Python,Pandas,NumPy,Scikit-learn,TensorFlow,SQL,Statistics,Machine Learning'),
('DevOps Engineer', 'Manage automated CI/CD pipelines, cloud infrastructure, and containers', 'Docker,Kubernetes,AWS,Linux,Git,CI/CD,Terraform,Python');

-- Member 3: Categories for Placement Preparation
INSERT INTO categories (name, type, description) VALUES
('Arrays & Strings', 'dsa', 'Problems on arrays, strings, two pointers, and sliding window'),
('Linked Lists & Trees', 'dsa', 'Singly, doubly linked lists and binary tree traversals'),
('Quantitative Aptitude', 'aptitude', 'Number systems, percentages, ratios, profit and loss'),
('Logical Reasoning', 'aptitude', 'Puzzles, sequences, direction sense, and syllogisms'),
('HR Interview', 'interview', 'Behavioral questions, STAR method, and leadership scenarios'),
('Technical Interview', 'interview', 'Core CS questions on OOP, DBMS, OS, and System Design');

-- Member 3: Sample Questions
INSERT INTO questions (category_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
(1, 'What is the average time complexity of searching in a balanced Binary Search Tree?', 'O(n)', 'O(log n)', 'O(n log n)', 'O(1)', 'B', 'A balanced BST divides the search space in half at each level, resulting in O(log n).', 'easy'),
(1, 'Which data structure follows the Last In First Out (LIFO) principle?', 'Queue', 'Stack', 'Linked List', 'Binary Tree', 'B', 'A Stack follows the Last In First Out (LIFO) principle.', 'easy'),
(3, 'If A is 20% more than B, then B is what percentage less than A?', '16.67%', '20%', '25%', '15%', 'A', 'If A = 1.2 * B, then B = A / 1.2 = 0.8333 * A. Difference is (1 - 0.8333) = 16.67%.', 'medium'),
(4, 'Find the next number in the sequence: 2, 6, 12, 20, 30, ?', '40', '42', '36', '38', 'B', 'Differences are 4, 6, 8, 10, 12. Next term is 30 + 12 = 42.', 'medium');

-- Member 4: Learning Resources
INSERT INTO learning_resources (skill_name, resource_title, resource_url, resource_type, platform) VALUES
('React', 'React Official Documentation & Tutorial', 'https://react.dev/learn', 'tutorial', 'React.dev'),
('Python', 'Python for Everybody Specialization', 'https://www.py4e.com/', 'course', 'Coursera'),
('JavaScript', 'The Modern JavaScript Tutorial', 'https://javascript.info/', 'tutorial', 'JavaScript.info'),
('SQL', 'SQL Relational Database Tutorial', 'https://www.w3schools.com/sql/', 'tutorial', 'W3Schools'),
('Docker', 'Docker Getting Started Guide', 'https://docs.docker.com/get-started/', 'tutorial', 'Docker Docs');

-- Member 5: Sample Skill Listings
INSERT INTO skill_listings (user_id, skill_name, description, type, is_paid, price, status) VALUES
(1, 'React & Frontend Styling', 'Offering 1-on-1 tutoring on React Hooks and component design.', 'offer', FALSE, 0.00, 'active'),
(1, 'Cloud & AWS Basics', 'Looking for a peer to guide me through AWS EC2 and S3 deployment.', 'request', FALSE, 0.00, 'active');
