# CareerBridge – Team Integration Checklist (Member 1 ↔ Member 2)

**From:** Member 2 (Internship & Application Management)  
**To:** Member 1 (Platform Infrastructure & User Authentication)  
**Git Branch:** `feature/internship`  

---

## Overview

Member 2 has developed the complete **Internship & Application Management** module. It is isolated inside:
- Backend: `backend/app/internship/`
- Frontend: `frontend/src/modules/internship/`

Follow the checklist below to merge and connect this module into the central CareerBridge system.

---

## 1. Backend Integration Checklist

### Step 1: Database Migration / Table Creation
- [ ] Ensure Member 1's shared users table exists (e.g. `users` with primary key `id`).
- [ ] Confirm table names `internships`, `applications`, and `bookmarks` do not collide with other modules.
- [ ] Run `db.create_all()` or run the database migration. Note that `applications.student_id` and `bookmarks.student_id` are integer fields matching `users.id`.
- [ ] *(Optional)* Add foreign key constraint to Member 1's `users.id` in `backend/app/internship/models.py`:
  ```python
  student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
  ```

### Step 2: Register the Flask Blueprint
- [ ] In Member 1's Flask application factory (`create_app` in `backend/app/__init__.py`), import and register `internship_bp`:
  ```python
  from app.internship.routes import internship_bp
  app.register_blueprint(internship_bp)
  ```
- [ ] Verify that `/api/internships` and `/api/applications` are reachable.

### Step 3: JWT Configuration & Token Handshake
- [ ] Member 2's `auth_middleware.py` expects standard JWT Bearer tokens:
  - Header: `Authorization: Bearer <JWT_TOKEN>`
  - Claims supported:
    - `sub` (or `user_id` or `student_id`): Integer or String student ID
    - `role`: `'student'` or `'admin'` / `'staff'` / `'recruiter'`
    - `email`: User's email
    - `name`: User's display name
- [ ] Ensure Member 1 sets the same secret in `app.config["JWT_SECRET_KEY"]`.
- [ ] Test that regular student tokens can apply and view their own applications.
- [ ] Test that only admin/staff tokens can call `PATCH /api/applications/<id>/status`.

---

## 2. Frontend Integration Checklist

### Step 1: Install Dependencies
- [ ] Ensure Member 1's root `package.json` includes:
  - `lucide-react`
  - `tailwindcss`
  - `clsx`

### Step 2: Integrate Routes / Pages
- [ ] In Member 1's React router (`App.jsx` or router configuration), import the Member 2 pages:
  ```jsx
  import InternshipDashboard from './modules/internship/pages/InternshipDashboard';
  import InternshipListingsPage from './modules/internship/pages/InternshipListingsPage';
  import InternshipDetailsPage from './modules/internship/pages/InternshipDetailsPage';
  import MyApplicationsPage from './modules/internship/pages/MyApplicationsPage';
  import SavedInternshipsPage from './modules/internship/pages/SavedInternshipsPage';
  ```
- [ ] Recommended route paths:
  - `/internships` → `InternshipDashboard` or `InternshipListingsPage`
  - `/internships/:id` → `InternshipDetailsPage`
  - `/applications/my` → `MyApplicationsPage`
  - `/internships/saved` → `SavedInternshipsPage`

### Step 3: Connect Shared Auth Token
- [ ] Store Member 1's JWT token in browser `localStorage`:
  ```javascript
  localStorage.setItem('careerbridge_jwt_token', token);
  ```
- [ ] Member 2's `internshipApi.js` automatically reads this token and attaches `Authorization: Bearer <token>` to all HTTP requests.

---

## 3. Cross-Module Collaboration Points

| Team Member | Module | Integration Opportunity with Member 2 |
|---|---|---|
| **Member 1** | Auth & Users | Supplies `student_id` via JWT Bearer token. |
| **Member 3** | Placement Preparation | Can link from an internship detail page to recommended interview prep questions matching `required_skills`. |
| **Member 4** | Skill Gap Analysis | Can compare a student's profile against `internships.required_skills` and display a "Match Percentage" badge. |
| **Member 5** | Campus Skill Exchange | Students who need skills listed in an internship (e.g. Docker, React) can find student mentors on the campus exchange. |

---

## 4. Verification Tests

Run Member 2's Pytest suite to confirm zero regressions:
```bash
python -m pytest backend/tests
```
Expected result: **25 passed in < 1s**.

