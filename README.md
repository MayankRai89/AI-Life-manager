# 🌟 AI Life Manager

> An intelligent, wellness-aware personal operating system that integrates real-time emotional check-ins, circadian rhythm scheduling, health contexts, and multi-LLM orchestration to balance productivity with mental wellbeing.

---

## 🏗 Repository Structure

```
AI_Life Manager/
├── .github/
│   └── workflows/
│       └── backend-ci-cd.yml      # Automated Backend CI/CD Pipeline (Lint, Test, Docker Buildx, GHCR, Deploy)
├── backend/                       # Express 5, MongoDB / Atlas, Multi-LLM API Service
│   ├── src/                       # Models, Controllers, Services, AI Orchestrator
│   ├── Dockerfile                 # Multi-stage container definition (Node.js)
│   ├── README.md                  # Comprehensive Backend Architecture & API Documentation
│   └── package.json
├── frontend/                      # React 19, Vite, Redux Toolkit, Tailwind CSS Client
│   ├── src/                       # Components, Views, Redux Slices, API Client
│   ├── nginx.conf                 # Production Nginx reverse proxy & SPA routing config
│   ├── Dockerfile                 # Production multi-stage build (Vite build + Nginx runner)
│   └── package.json
└── docker-compose.yml             # Full-stack container orchestration (Frontend + Backend + MongoDB)
```

---

## 🚀 Quick Links & Documentation

- **[Backend Service Documentation](file:///e:/AI_Life%20Manager/backend/README.md)**: Full architecture breakdown, Entity-Relationship diagrams, detailed data models, AI orchestration logic (Gemini, Mistral, Cohere), and complete API endpoint specifications.
- **[CI/CD Workflow Specification](file:///e:/AI_Life%20Manager/.github/workflows/backend-ci-cd.yml)**: Continuous integration, live MongoDB health test, multi-stage Docker build, GHCR publishing, and deployment webhook triggers.

---

## ⚡ Local Development Setup

If running locally without Docker:

### 1. Backend Service
```bash
cd backend
npm install
cp .env.example .env     # Add your MongoDB URI (Local or Atlas) & AI API keys
npm run dev              # Starts Express on http://localhost:3000
```

### 2. Frontend Client
```bash
cd frontend
npm install
npm run dev              # Starts Vite dev server on http://localhost:5173
```

---

## 🐳 Run Entire Project with Docker (One-Command Setup)

The repository provides a production-grade **Docker Compose** setup orchestrating:
1. **Frontend**: React SPA served with Nginx + dynamic `/api/*` reverse proxy.
2. **Backend**: Express 5 API with multi-LLM resilience and health check probe.
3. **Database**: MongoDB 7.0 container with persistent volumes (or connection to MongoDB Atlas).

### Starting All Services

```powershell
# Build and start all containers in background
docker compose up -d --build

# View real-time logs across all services
docker compose logs -f

# Check container health and status
docker compose ps

# Stop all containers
docker compose down
```

### Service Map & Access URLs

| Service | Container Name | Host Port / Access URL | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | `ai_life_frontend` | **[http://localhost:8080](http://localhost:8080)** | React SPA served by Nginx with client-side routing |
| **Backend API (Direct)** | `ai_life_backend` | **[http://localhost:3001](http://localhost:3001)** | Express 5 API (mapped to 3001 to prevent conflicts with local dev) |
| **API via Reverse Proxy** | `ai_life_frontend` | **[http://localhost:8080/api/](http://localhost:8080/api/)** | Proxied seamlessly to `backend:3000` via Nginx |
| **Local MongoDB** | `ai_life_mongodb` | `localhost:27017` | Local DB fallback with persistent volume `ai_life_mongo_data` |

> [!TIP]
> **MongoDB Atlas Support**: The backend container automatically loads connection settings from `backend/.env`. When using a `mongodb+srv://` Atlas connection, built-in DNS fallbacks (`8.8.8.8` / `1.1.1.1`) ensure reliable name resolution inside Docker.

---

## 🔧 Architecture & Docker Highlights

- **Dynamic DNS Upstream Resolution**: The frontend [nginx.conf](file:///e:/AI_Life%20Manager/frontend/nginx.conf) utilizes Docker's internal resolver (`127.0.0.11`) and runtime variables (`$backend_upstream`), ensuring Nginx boots instantly without crashing even if the backend container is still initializing.
- **Port Conflict Protection**: Host ports are assigned (`8080` for Docker frontend, `3001` for Docker backend) so you can run Docker and local development servers (`npm run dev`) side-by-side without port collisions.
- **Rootless & Multi-Stage Containers**: Both frontend and backend Dockerfiles utilize multi-stage caching and non-root execution (`node:node` and unprivileged Nginx) for minimal footprint and enhanced security.
