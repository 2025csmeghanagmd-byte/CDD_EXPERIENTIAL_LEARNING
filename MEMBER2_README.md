# CareerBridge – Internship & Application Management Module (Member 2)

**Assigned Contributor:** Member 2  
**Project:** CareerBridge – Internship, Placement Preparation and Campus Skill Exchange Platform  
**Git Feature Branch:** `feature/internship`  

---

## 1. Module Overview

The **Internship & Application Management** module is the dedicated subsystem of the **CareerBridge** college platform responsible for the complete lifecycle of student internship discovery, application submission, application progress tracking, and bookmarking.

Designed with an isolated architecture, this module plugs seamlessly into the wider multi-module team system (managed by Member 1 for core authentication and shared infrastructure, Member 3 for placement preparation, Member 4 for skill gap analysis, and Member 5 for skill exchange).

---

## 2. Features Implemented

### 1. Internship Listing & Exploration
- High-visibility, responsive cards displaying company name, logo initials, title, location, work mode (`Remote`, `Hybrid`, `On-site`), duration, stipend, deadline, and skills badges.
- Seed data helper containing 8 diverse, realistic industry internship records (Razorpay, Swiggy, Zoho, Infosys, Flipkart, OpenSource India, CRED, TCS).
- Relative badge counters indicating whether the student has already applied or bookmarked each opportunity.

### 2. Multi-Criteria Search & Filtering
- **Keyword Search:** Real-time query matching across internship titles, company names, and technical skills.
- **Location Filter:** Filter by key tech hubs (Bengaluru, Hyderabad, Chennai, Pune, Pan India, or All).
- **Work Mode Filter:** Pill buttons to filter `Remote`, `Hybrid`, or `On-site`.
- **Stipend Type:** Toggle between Paid Only, Unpaid / Non-monetary, or All.
- **Sorting Options:** Sort by `Latest First`, `Application Deadline (Earliest)`, or `Oldest First`.
- **Pagination:** Clean controls (`page` and `limit`) with total page counts.

### 3. Dedicated Internship Details View
- Full company overview, role description, key responsibilities checklist, eligibility criteria, and required technical skills tags.
- Direct bookmark toggle button with instant state update.
- Dynamic CTA: Displays **"Apply Now"** or an **"Already Applied"** badge showing current review status.

### 4. Application Submission Flow
- Interactive modal with form validation.
- Fields: Resume link (Google Drive, LinkedIn, GitHub, or portfolio URL), cover letter with character counter, and highlighted relevant skills.
- **Duplicate Prevention:** Database unique constraint and backend business logic prevent a student from submitting multiple applications for the same internship.
- Instant submission confirmation with celebratory dialog and quick link to the application tracker.

### 5. Application Tracking & Status Lifecycle
- Student view showing all submitted applications.
- Supports all required lifecycle stages:
  - `Applied` (Default initial status)
  - `Under Review` (Application under evaluation)
  - `Shortlisted` (Candidate selected for interview)
  - `Selected` (Final internship offer extended)
  - `Rejected` (Not selected)
- Visual progress bar / milestone indicators.
- **Security Rule:** Regular students are strictly forbidden from altering their own application status.
- **Demonstration / Examiner Tool:** Includes a built-in status simulator modal for faculty review, demonstrating how recruiter actions update the student view in real time.

### 6. Bookmark Management
- One-click bookmarking from listing cards, details pages, and saved listings.
- Dedicated **Saved Internships** page (`/internships/saved`).
- Idempotent and duplicate-safe bookmark handling.

### 7. Multi-Persona Switcher for College Evaluation
- Switch between **Student Alex Johnson (ID 1)**, **Student Priya Sharma (ID 2)**, and **Placement Officer / Recruiter (ID 99)** directly in the navbar.
- Demonstrates true data isolation: Student 1 sees only their applications/bookmarks, while Student 2 sees theirs.

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React icons
- **Backend:** Python 3, Flask REST API
- **Database:** MySQL (InnoDB) / SQLite fallback for instant zero-dependency local testing
- **ORM:** SQLAlchemy 2.x
- **Authentication:** JWT-ready architecture (RFC 7519 Bearer token integration)
- **Testing:** Pytest (25 test cases covering all CRUD, validations, duplicates, and role authorization)
- **Containerization:** Docker & Docker Compose

---

## 4. Folder Structure

```
mithilesh cdd proj/
├── docker-compose.yml
├── .gitignore
├── MEMBER2_README.md
├── TEAM_INTEGRATION_CHECKLIST.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── run.py
│   ├── app/
│   │   ├── __init__.py                # App factory, CORS, Blueprint registration
│   │   ├── config.py                  # Database and JWT configuration
│   │   ├── extensions.py              # Shared SQLAlchemy instance
│   │   ├── auth_middleware.py         # JWT decoder & role authorization decorators
│   │   └── internship/
│   │       ├── __init__.py            # Blueprint definition (/api)
│   │       ├── models.py              # Internship, Application, Bookmark SQLAlchemy models
│   │       ├── schemas.py             # Request validation logic
│   │       ├── services.py            # Business logic layer
│   │       └── routes.py              # REST API route handlers
│   └── tests/
│       ├── conftest.py                # Pytest fixtures and mock JWT generators
│       ├── test_internships.py        # Listing, search, filter, sort tests
│       ├── test_applications.py       # Apply, duplicate prevention, ownership tests
│       ├── test_bookmarks.py          # Bookmark add, idempotence, remove tests
│       └── test_authorization.py      # Student vs Admin role permission tests
│
└── frontend/
    ├── Dockerfile
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                    # Root tab router & state coordinator
        ├── index.css                  # Tailwind styles
        ├── components/
        │   └── shared/
        │       ├── Navbar.jsx         # Navigation and persona switcher
        │       └── Footer.jsx         # Architecture metadata footer
        └── modules/
            └── internship/
                ├── components/
                │   ├── InternshipCard.jsx
                │   ├── SearchAndFilter.jsx
                │   ├── StatusBadge.jsx
                │   ├── ApplyModal.jsx
                │   ├── ApplicationDetailsModal.jsx
                │   ├── AdminStatusModal.jsx
                │   └── StatsOverview.jsx
                ├── pages/
                │   ├── InternshipDashboard.jsx
                │   ├── InternshipListingsPage.jsx
                │   ├── InternshipDetailsPage.jsx
                │   ├── MyApplicationsPage.jsx
                │   └── SavedInternshipsPage.jsx
                ├── services/
                │   └── internshipApi.js
                ├── hooks/
                │   ├── useInternships.js
                │   ├── useBookmarks.js
                │   └── useApplications.js
                └── styles/
                    └── internship.css
```

---

## 5. Database Schema

All tables are designed with MySQL compatibility (`ENGINE=InnoDB`, `utf8mb4`).

### Table: `internships`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | Primary Key, Auto Increment | Unique internship ID |
| `title` | `VARCHAR(255)` | Not Null, Index | Position title |
| `company_name` | `VARCHAR(255)` | Not Null, Index | Hiring company name |
| `location` | `VARCHAR(255)` | Not Null, Index | City / Region / Pan India |
| `work_mode` | `VARCHAR(50)` | Not Null, Index | `Remote`, `Hybrid`, `On-site` |
| `description` | `TEXT` | Not Null | Complete role overview |
| `eligibility` | `TEXT` | Nullable | Course, year, CGPA requirements |
| `responsibilities` | `TEXT` | Nullable | Semicolon-separated tasks |
| `required_skills` | `VARCHAR(500)`| Not Null, Index | Comma-separated skills |
| `stipend` | `VARCHAR(100)` | Not Null | Monthly stipend / Unpaid |
| `duration` | `VARCHAR(100)` | Not Null | Duration (e.g. 3 Months, 6 Months) |
| `application_deadline` | `DATETIME` | Not Null, Index | Expiration date |
| `is_paid` | `BOOLEAN` | Default True, Index | Paid vs unpaid flag |
| `created_at` | `DATETIME` | UTC Timestamp, Index | Creation timestamp |

### Table: `applications`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | Primary Key, Auto Increment | Unique application ID |
| `internship_id` | `INT` | Foreign Key (`internships.id`), Index | Targeted internship |
| `student_id` | `INT` | Not Null, Index | User ID from Member 1's user system |
| `resume_url` | `VARCHAR(500)`| Not Null | Link to student's resume |
| `cover_letter` | `TEXT` | Nullable | Statement of interest |
| `relevant_skills` | `VARCHAR(500)`| Nullable | Skills highlighted for this application |
| `status` | `VARCHAR(50)` | Default 'Applied', Index | `Applied`, `Under Review`, `Shortlisted`, `Selected`, `Rejected` |
| `applied_at` | `DATETIME` | UTC Timestamp, Index | Application timestamp |

**Unique Constraint:** `uq_internship_student_application (internship_id, student_id)` prevents double applications.

### Table: `bookmarks`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INT` | Primary Key, Auto Increment | Unique bookmark ID |
| `internship_id` | `INT` | Foreign Key (`internships.id`), Index | Bookmarked internship |
| `student_id` | `INT` | Not Null, Index | Student ID |
| `created_at` | `DATETIME` | UTC Timestamp, Index | Saved timestamp |

**Unique Constraint:** `uq_internship_student_bookmark (internship_id, student_id)` prevents duplicate bookmarks.

---

## 6. REST API Endpoint Documentation

### Base URL: `/api`

#### 1. List Internships
- **Route:** `GET /api/internships`
- **Query Parameters:** `search`, `location`, `work_mode`, `is_paid`, `sort_by`, `page`, `limit`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Frontend Engineer Intern (React / TypeScript)",
      "company_name": "Razorpay Payments",
      "location": "Bengaluru, Karnataka",
      "work_mode": "Hybrid",
      "stipend": "₹35,000 / month",
      "duration": "6 Months",
      "application_deadline": "2026-12-06T00:00:00Z",
      "is_paid": true,
      "skills_list": ["React", "JavaScript", "TypeScript", "Tailwind CSS"],
      "is_bookmarked": false,
      "has_applied": false,
      "total_applications": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 9,
    "total_items": 8,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

#### 2. Get Single Internship
- **Route:** `GET /api/internships/<id>`
- **Response `200 OK`:** Returns full internship details including `description`, `eligibility`, and student application status.
- **Response `404 Not Found`:** If ID does not exist.

#### 3. Submit Application
- **Route:** `POST /api/applications`
- **Headers:** `Authorization: Bearer <token>` or `X-Student-Id: <id>`
- **Request Body:**
```json
{
  "internship_id": 1,
  "resume_url": "https://drive.google.com/file/d/my-resume/view",
  "cover_letter": "I have completed React coursework and built full-stack apps.",
  "relevant_skills": "React, Tailwind, JavaScript"
}
```
- **Response `201 Created`:** Returns created application record.
- **Response `409 Conflict`:** If student has already applied for this internship.

#### 4. Get My Applications
- **Route:** `GET /api/applications/my`
- **Query Parameters:** `status` (Optional: `Applied`, `Shortlisted`, etc.)
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 10,
      "internship_id": 1,
      "status": "Applied",
      "resume_url": "https://drive.google.com/file/d/my-resume/view",
      "applied_at": "2026-11-11T06:00:00Z",
      "internship": {
        "title": "Frontend Engineer Intern (React / TypeScript)",
        "company_name": "Razorpay Payments"
      }
    }
  ]
}
```

#### 5. Get Single Application
- **Route:** `GET /api/applications/<id>`
- **Authorization:** Only the student who submitted the application or an admin/staff member may view this.

#### 6. Update Application Status (Staff / Admin Only)
- **Route:** `PATCH /api/applications/<id>/status`
- **Headers:** Requires role `admin`, `staff`, or `recruiter`.
- **Request Body:**
```json
{
  "status": "Shortlisted"
}
```
- **Response `200 OK`:** Updated application.
- **Response `403 Forbidden`:** If called by a regular student.

#### 7. Bookmark an Internship
- **Route:** `POST /api/internships/<id>/bookmark`
- **Response `200 OK`:** `{ "success": true, "message": "Internship bookmarked successfully.", "is_bookmarked": true }`

#### 8. Remove a Bookmark
- **Route:** `DELETE /api/internships/<id>/bookmark`
- **Response `200 OK`:** `{ "success": true, "message": "Bookmark removed successfully.", "is_bookmarked": false }`

#### 9. Get Saved Bookmarks
- **Route:** `GET /api/bookmarks`
- **Response `200 OK`:** List of bookmarked internships for the student.

#### 10. Dashboard Stats
- **Route:** `GET /api/internships/stats`
- **Response `200 OK`:** Summary counts of available internships, applications, and saved items.

---

## 7. Installation & Execution Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- (Optional) MySQL 8.0 or Docker

### Option A: Local Development Run (Fastest)

#### 1. Start Backend API Server
```powershell
# Open Terminal 1
cd backend
python run.py
```
*Backend runs on `http://127.0.0.1:5000`. By default, it initializes an automatic local SQLite database seeded with sample internships.*

To run with MySQL:
```powershell
$env:DATABASE_URL="mysql+pymysql://cb_user:cb_password@localhost:3306/careerbridge"
python run.py
```

#### 2. Start Frontend React Vite App
```powershell
# Open Terminal 2
cd frontend
npm.cmd run dev
```
*Frontend runs on `http://localhost:3000` and automatically proxies `/api` calls to the Flask backend.*

### Option B: Docker Containerized Run
```bash
docker-compose up --build
```
*Spins up MySQL, Flask Backend, and Frontend containers simultaneously.*

---

## 8. Testing Instructions

The Pytest suite tests all critical business logic:
- Search and filtering by skills, location, work mode, and stipend
- Duplicate application prevention (`409 Conflict`)
- Application ownership and access controls
- Bookmark addition, idempotence, and deletion
- Role-based authorization: Students cannot change status (`403 Forbidden`); Admins can update status (`200 OK`)
- JWT Bearer token authentication parsing

### Running Pytest
```powershell
python -m pytest backend/tests -v
```

---

## 9. Integration Instructions for Member 1

Member 1 can connect this module in under 2 minutes:

1. **Register the Backend Blueprint:**
   In Member 1's main Flask `app/__init__.py`:
   ```python
   from app.internship.routes import internship_bp
   app.register_blueprint(internship_bp)
   ```

2. **Supply Shared JWT Secret:**
   Ensure Member 1's auth provider sets:
   ```python
   app.config["JWT_SECRET_KEY"] = "careerbridge-shared-jwt-secret-key-2026"
   ```
   Our `auth_middleware.py` automatically extracts the student ID from the standard JWT `sub` or `user_id` claim.

3. **Mount Frontend Routes:**
   Import and mount:
   ```jsx
   import InternshipDashboard from './modules/internship/pages/InternshipDashboard';
   import InternshipListingsPage from './modules/internship/pages/InternshipListingsPage';
   import InternshipDetailsPage from './modules/internship/pages/InternshipDetailsPage';
   import MyApplicationsPage from './modules/internship/pages/MyApplicationsPage';
   import SavedInternshipsPage from './modules/internship/pages/SavedInternshipsPage';
   ```

Refer to `TEAM_INTEGRATION_CHECKLIST.md` for the step-by-step verification checklist.

---

## 10. Known Limitations & Future Improvements

1. **File Upload for Resumes:** Currently accepts authenticated URLs (Google Drive / LinkedIn / portfolio link). Can add direct PDF upload to AWS S3 / Cloudinary if the team chooses.
2. **Email Notifications:** Can connect with an SMTP service (SendGrid / Nodemailer) to email students when status changes from `Under Review` to `Shortlisted`.
3. **Skill Gap Cross-Linking:** Member 4's Skill Gap Analysis module can read required skills from `internships.required_skills` to compare against a student's profile.

