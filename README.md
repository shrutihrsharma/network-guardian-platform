# Network Guardian Platform

Monorepo for a compliance platform with one backend and two UI clients:

- backend: Spring Boot API with MongoDB support.
- frontend: Angular application.
- frontend-react: React/TanStack Start application.

## Repository Structure

- backend: Java 21, Spring Boot 3.x, Maven Wrapper.
- frontend: Angular 21, npm.
- frontend-react: React 19, Vite/TanStack Start, npm (bun config is also present).

## Prerequisites

- Java 21
- Node.js 20+ and npm
- MongoDB (for backend persistence)

## Quick Start

Run each app in its own terminal.

### 1) Start backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs on http://localhost:8080 by default.

### 2) Start Angular frontend

```bash
cd frontend
npm install
npm start
```

Angular dev server runs on http://localhost:4200.
API calls under /api are proxied to http://localhost:8080 via frontend/proxy.conf.json.

### 3) Start React frontend

```bash
cd frontend-react
npm install
npm run dev
```

React dev server runs on the Vite default port (usually http://localhost:5173).

## Build and Test

- Backend compile: `cd backend && ./mvnw -DskipTests compile`
- Backend tests: `cd backend && ./mvnw test`
- Angular build: `cd frontend && npm run build`
- Angular tests: `cd frontend && npm test`
- React build: `cd frontend-react && npm run build`
- React lint: `cd frontend-react && npm run lint`

## Notes

- Use either frontend (Angular) or frontend-react (React) with the same backend.
- Keep backend running before testing API-driven UI flows.