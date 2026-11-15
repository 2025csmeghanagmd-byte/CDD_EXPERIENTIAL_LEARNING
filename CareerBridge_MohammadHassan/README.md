# 🎓 CareerBridge — Campus Career Development Platform

CareerBridge is a comprehensive web-based platform designed to bridge the gap between academic learning and professional careers. It provides students with tools for internship discovery, placement preparation, skill gap analysis, and peer-to-peer skill exchange — all in one unified platform.

---

## 👥 Team Structure

| Member   | Module                        | Description                                      |
|----------|-------------------------------|--------------------------------------------------|
| Member 1 | **User Auth & Profile**       | Registration, login, JWT auth, profile management |
| Member 2 | **Internship Portal**         | Internship listings, applications, bookmarks      |
| Member 3 | **Placement Preparation**     | DSA, aptitude, interview prep, mock tests          |
| Member 4 | **Skill Gap Analyzer**        | Skill assessment, gap analysis, learning resources |
| Member 5 | **Skill Exchange Platform**   | Peer skill sharing, requests, reviews              |

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, React Router, Axios |
| Backend    | Python, Flask, Flask-JWT-Extended   |
| Database   | MySQL 8.0                           |
| DevOps     | Docker, Docker Compose              |
| Auth       | JWT (JSON Web Tokens)               |

---

## 📁 Project Structure

```
CareerBridge/
├── backend/
│   ├── app/
│   │   ├── __init__.py              # Flask app factory
│   │   ├── config.py                # App configuration
│   │   ├── models/                  # Database models
│   │   │   ├── user.py
│   │   │   ├── internship.py
│   │   │   ├── placement.py
│   │   │   ├── skill_gap.py
│   │   │   └── skill_exchange.py
│   │   └── routes/                  # API route blueprints
│   │       ├── auth.py
│   │       ├── profile.py
│   │       ├── internships.py
│   │       ├── placement.py
│   │       ├── skill_gap.py
│   │       └── skill_exchange.py
│   ├── run.py                       # App entry point
│   ├── requirements.txt             # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── main.jsx                 # React entry point
│   │   ├── App.jsx                  # Root component & routing
│   │   ├── App.css                  # Global styles
│   │   ├── index.css                # Base styles
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance
│   │   ├── components/              # Shared UI components
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/                   # Page components per module
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Internships.jsx
│   │   │   ├── InternshipDetail.jsx
│   │   │   ├── PlacementPrep.jsx
│   │   │   ├── MockTest.jsx
│   │   │   ├── SkillGap.jsx
│   │   │   └── SkillExchange.jsx
│   │   └── context/
│   │       └── AuthContext.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── database/
│   └── schema.sql                   # Complete MySQL schema + seed data
├── docker-compose.yml               # Multi-service orchestration
├── .gitignore
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.11+
- **MySQL** 8.0+
- **Git**
- **Docker & Docker Compose** (optional, for containerized setup)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/CareerBridge.git
cd CareerBridge
```

### 2. Database Setup

```bash
# Log into MySQL
mysql -u root -p

# Run the schema file
source database/schema.sql;
```

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env   # Then edit with your DB credentials

# Run the server
python run.py
```

The backend will start at **http://localhost:5000**.

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start at **http://localhost:3000**.

---

## 🐳 Docker Setup

To run the entire stack with Docker:

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up --build -d

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

**Services:**

| Service    | URL                    |
|------------|------------------------|
| Frontend   | http://localhost:3000   |
| Backend    | http://localhost:5000   |
| MySQL      | localhost:3306          |

---

## 📡 API Endpoints Overview

### Authentication (Member 1)

| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| POST   | `/api/auth/register`  | Register a new user     |
| POST   | `/api/auth/login`     | Login and get JWT token |
| GET    | `/api/auth/profile`   | Get current user profile|
| PUT    | `/api/auth/profile`   | Update user profile     |

### Internships (Member 2)

| Method | Endpoint                           | Description                |
|--------|------------------------------------|----------------------------|
| GET    | `/api/internships`                 | List all internships       |
| GET    | `/api/internships/:id`             | Get internship details     |
| POST   | `/api/internships`                 | Create new internship      |
| POST   | `/api/internships/:id/apply`       | Apply to internship        |
| GET    | `/api/internships/applications`    | Get user's applications    |
| POST   | `/api/internships/:id/bookmark`    | Bookmark an internship     |
| GET    | `/api/internships/bookmarks`       | Get user's bookmarks       |

### Placement Preparation (Member 3)

| Method | Endpoint                        | Description             |
|--------|---------------------------------|-------------------------|
| GET    | `/api/placement/categories`     | List all categories     |
| GET    | `/api/placement/questions/:cat` | Get questions by category |
| GET    | `/api/placement/mock-tests`     | List mock tests         |
| GET    | `/api/placement/mock-tests/:id` | Get mock test questions |
| POST   | `/api/placement/mock-tests/:id/submit` | Submit test answers |
| GET    | `/api/placement/results`        | Get user's test results |

### Skill Gap Analyzer (Member 4)

| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| GET    | `/api/skillgap/roles`            | List all job roles       |
| POST   | `/api/skillgap/analyze`          | Analyze skill gaps       |
| GET    | `/api/skillgap/results`          | Get analysis results     |
| GET    | `/api/skillgap/resources/:skill` | Get learning resources   |
| POST   | `/api/skillgap/skills`           | Add user skill           |
| GET    | `/api/skillgap/skills`           | Get user's skills        |

### Skill Exchange (Member 5)

| Method | Endpoint                               | Description             |
|--------|----------------------------------------|-------------------------|
| GET    | `/api/exchange/listings`               | List skill listings     |
| POST   | `/api/exchange/listings`               | Create skill listing    |
| POST   | `/api/exchange/listings/:id/request`   | Request skill exchange  |
| GET    | `/api/exchange/requests`               | Get exchange requests   |
| PUT    | `/api/exchange/requests/:id`           | Update request status   |
| POST   | `/api/exchange/reviews`                | Submit a review         |
| GET    | `/api/exchange/reviews/:userId`        | Get user reviews        |

---

## 🌿 Git Workflow

### Branch Naming Convention

```
main                    # Production-ready code
├── develop             # Integration branch
├── feature/auth        # Member 1: Authentication & Profile
├── feature/internships # Member 2: Internship Portal
├── feature/placement   # Member 3: Placement Preparation
├── feature/skillgap    # Member 4: Skill Gap Analyzer
└── feature/exchange    # Member 5: Skill Exchange Platform
```

### Workflow Steps

1. **Pull the latest** from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create your feature branch**:
   ```bash
   git checkout -b feature/your-module
   ```

3. **Make changes, commit with clear messages**:
   ```bash
   git add .
   git commit -m "feat(module): description of changes"
   ```

4. **Push and create a Pull Request**:
   ```bash
   git push origin feature/your-module
   ```
   Then open a PR to `develop` on GitHub.

5. **After review, merge** into `develop`.

### Commit Message Convention

```
feat(auth): add JWT login endpoint
fix(internships): fix pagination bug
docs(readme): update API endpoints
style(frontend): improve responsive layout
refactor(skillgap): optimize analysis algorithm
```

---

## 🤝 Contributing Guidelines

1. **Fork** the repository and clone locally.
2. **Create a branch** from `develop` for your feature/fix.
3. **Follow the coding style** — use linters and formatters.
4. **Write meaningful commit messages** following the convention above.
5. **Test your changes** before pushing.
6. **Open a Pull Request** with a clear description of changes.
7. **Request a code review** from at least one team member.
8. **Do not push directly** to `main` or `develop`.

---

## 📄 License

This project is developed as part of an academic course project.

---

<p align="center">Made with ❤️ by the CareerBridge Team</p>
