# CareerBridge

Integrated Internship, Placement Preparation and Campus Skill Exchange Platform.

## Technology stack
- Frontend: React, Vite, JavaScript
- Backend: Python, Flask, REST API
- Database: MySQL
- Testing: Pytest
- Collaboration/CI: Git, GitHub, GitHub Actions
- Containers: Docker Compose

## Repository layout
- `frontend/` — shared React application
- `backend/` — Flask application, Blueprints, services and tests
- `database/` — schema and sample seed data
- `docs/` — API, database and team workflow documentation
- `.github/workflows/` — automated checks

## Local setup

### 1. Backend
From the repository root:

```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# Windows CMD: .venv\Scripts\activate.bat
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Copy `backend/.env.example` to `backend/.env` and update the values.
Create the MySQL database named `careerbridge_db` before starting the API.

```bash
python run.py
```

API health check: `http://127.0.0.1:5000/api/health`

### 2. Frontend
Open a second terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173`.

### 3. Docker
Copy `backend/.env.example` to `backend/.env`, update the local secret if desired, then run:

```bash
docker compose up --build
```

The frontend is served at `http://localhost:8080` and the API at `http://localhost:5000`.

## Team development rules
1. `main` contains stable, reviewed code.
2. `integration` is the shared development branch.
3. Each member works in their own `feature/*` branch.
4. Pull the latest `integration` before starting work.
5. Keep changes inside your assigned module whenever possible.
6. Submit a Pull Request into `integration`; run tests before merging.
7. Coordinate edits to shared files, database schema, API contracts and dependencies.
8. Never commit `.env`, passwords, API keys, virtual environments or `node_modules`.

See `docs/team-workflow.md` before beginning feature development.

## Important
This ZIP is a project scaffold, not the completed CareerBridge application. The team must agree on the final ER diagram, API request/response contracts, authentication rules and module requirements before implementing features.
