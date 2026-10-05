# 🌟 AI Life Manager

> An intelligent, wellness-aware personal operating system that integrates real-time emotional check-ins, circadian rhythm scheduling, health contexts, and multi-LLM orchestration to balance productivity with mental wellbeing.

---

## 🏗 Repository Structure

This repository is organized as a fullstack application:

```
AI_Life Manager/
├── .github/
│   └── workflows/
│       └── backend-ci-cd.yml      # Automated Backend CI/CD Pipeline (Lint, Test, Docker, Deploy)
├── backend/                       # Express 5, MongoDB, Multi-LLM API Service
│   ├── src/                       # Models, Controllers, Services, AI Orchestrator
│   ├── Dockerfile                 # Multi-stage container definition
│   ├── README.md                  # Comprehensive Backend Architecture & API Documentation
│   └── package.json
└── frontend/                      # React / Vite Client Application
```

---

## 🚀 Quick Links & Documentation

- **[Backend Service Documentation](file:///e:/AI_Life%20Manager/backend/README.md)**: Full architecture breakdown, Entity-Relationship diagrams, detailed working data models, AI orchestration logic (Gemini, Mistral, Cohere), and complete API endpoint specifications.
- **[CI/CD Workflow Specification](file:///e:/AI_Life%20Manager/.github/workflows/backend-ci-cd.yml)**: Continuous integration, live MongoDB health test, multi-stage Docker build, GHCR publishing, and deployment webhook triggers.

---

## ⚡ Quick Start

### 1. Backend Service
```bash
cd backend
npm install
cp .env.example .env     # Update your Mongo URI & API keys in .env
npm run dev              # Starts on http://localhost:3000
```

### 2. Frontend Client
```bash
cd frontend
npm install
npm run dev              # Starts on http://localhost:5173
```
