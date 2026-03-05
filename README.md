# 🏥 NFC MedScan System

A full-stack NFC-based patient data management system with JWT authentication, a Patient Portal, and a Hospital Portal.

## Architecture

```
NFC/
├── BACKEND-END/          # Spring Boot 3.4.2 + MySQL – REST API + JWT Auth
├── FRONTEND/
│   ├── frontend/         # React (Vite) – Patient Portal  → :3000
│   └── hospital-portal/  # React (Vite) – Hospital Portal → :3001
├── docker-compose.yml    # One-command deployment
└── .env.example          # Environment variable template
```

## 🚀 Quick Start (Docker)

**Requirements:** Docker Desktop

```bash
# 1. Clone and enter the project
cd NFC

# 2. Set up environment
cp .env.example .env
# Edit .env and set strong values for DB_PASSWORD and JWT_SECRET

# 3. Start everything
docker compose up --build
```

| Service | URL |
|---|---|
| Patient Portal | http://localhost:5173 |
| Hospital Portal | http://localhost:5174 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

## 🛠️ Local Development

**Requirements:** Java 21, Maven, Node 20, MySQL 8

```bash
# Terminal 1 — Backend
cd BACKEND-END
./mvnw.cmd spring-boot:run

# Terminal 2 — Patient Portal (http://localhost:5173)
cd FRONTEND/frontend
npm run dev

# Terminal 3 — Hospital Portal (http://localhost:5174)
cd FRONTEND/hospital-portal
npm run dev
```

## Features

### Patient Portal (port 3000/5173)
- JWT login & registration
- Medical profile editor (allergies, conditions, medications, insurance)
- Access log history
- NFC card linking & data consent settings

### Hospital Portal (port 3001/5174)
- **Staff-only login** (DOCTOR / NURSE / RECEPTIONIST / ADMIN)
- **Animated NFC Scanner** — enter card ID → instant patient profile
- Full patient view with on-demand AI clinical suggestions
- Visit notes: add clinical notes, view visit history
- Role-guarded: only DOCTOR/NURSE/ADMIN can write notes

### Backend API
- Spring Boot 3.4.2 + Spring Security + JJWT
- Role-Based Access Control (RBAC)
- Access audit logging & data consent enforcement
- Swagger UI at `/swagger-ui.html`

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DB_ROOT_PASSWORD` | MySQL root password | — |
| `DB_NAME` | Database name | `nfc_health_db` |
| `DB_USER` / `DB_PASSWORD` | App DB credentials | — |
| `JWT_SECRET` | JWT signing key (≥64 chars) | — |
| `PATIENT_PORTAL_PORT` | Patient portal external port | `3000` |
| `HOSPITAL_PORTAL_PORT` | Hospital portal external port | `3001` |

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.4.2, Spring Security, JJWT 0.12.6 |
| Database | MySQL 8.3 |
| Patient Portal | React 18, Vite 7, Axios, React Router v6 |
| Hospital Portal | React 18, Vite 7, Axios, React Router v6 |
| Containerization | Docker, Docker Compose, Nginx |
