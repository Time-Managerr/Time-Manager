# Time Manager

A comprehensive full-stack application for managing employee time, attendance, and performance metrics with role-based access control.

## Features

- ⏱️ **Clock In/Out System** - Employee attendance tracking with automatic hour calculation
- 👥 **Team Management** - Create and manage teams with assigned managers
- 📅 **Planning** - Schedule employees with role-based restrictions (admin/manager only)
- 📊 **KPI Dashboard** - Track lateness and working hours metrics at user and team levels
- 🔐 **Role-Based Access** - Three tiers: Admin, Manager, Employee with granular permissions
- 🔄 **Real-time Updates** - Dashboard shows live metrics and performance indicators
- 📱 **Responsive UI** - Built with Vue.js for smooth, modern experience
- 📝 **API Documentation** - Complete Swagger/OpenAPI documentation
- ✅ **Comprehensive Testing** - Backend (93.7%) and frontend test suites included

## Tech Stack

### Frontend
- Vue.js 3 with Composition API
- Vite build tool
- Vitest for testing
- Chart.js for KPI visualizations
- Axios for HTTP requests

### Backend
- Node.js with Express
- Prisma ORM for database management
- MariaDB for data persistence
- JWT for authentication
- Jest & Supertest for API testing

### Infrastructure
- Docker & Docker Compose
- Nginx reverse proxy
- MariaDB 12.0.2

## Prerequisites

- [Docker](https://www.docker.com/get-started) & Docker Compose
- [Node.js 22+](https://nodejs.org/) (for local development)
- npm (comes with Node.js)

## Quick Start

### Production Mode (All in Docker)

```bash
# Start all containers
docker compose up -d

# Access application
http://localhost
```

Runs 4 containers:
- **db**: MariaDB database
- **backend**: Node.js API on port 3000
- **frontend**: Vue.js app served by Nginx
- **nginx**: Reverse proxy on port 80

### Development Mode (Docker DB + Local Frontend)

```bash
# Start only backend and database
docker compose up -d db backend

# In another terminal, start frontend with hot reload
cd frontend
npm install
npm run dev

# Access application
http://localhost:5173
```

Features:
- Hot reload for Vue components
- Live code changes without rebuilding Docker images
- API proxy routes `/api/*` to `http://localhost:3000`

## API Documentation

Interactive API documentation available at:
```
http://localhost/api-docs
```

### Endpoints Overview

**Authentication**
- `POST /auth/login` - User login

**Users**
- `GET /users` - List all users
- `POST /users` - Create user
- `GET /users/{id}` - Get user details
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

**Clocks (Attendance)**
- `POST /clocks` - Clock in
- `PUT /clocks/{idClock}/clockout` - Clock out
- `GET /clocks` - Get all clocks
- `GET /clocks/user/{userId}` - Get user's clocks
- `DELETE /clocks/{id}` - Delete clock

**Planning**
- `GET /planning` - Get planning
- `POST /planning` - Create planning (admin/manager)
- `PUT /planning/{id}` - Update planning (admin/manager)
- `DELETE /planning/{id}` - Delete planning (admin only)

**Teams**
- `GET /teams` - List all teams
- `POST /teams` - Create team (admin/manager)
- `GET /teams/{id}` - Get team details
- `GET /teams/user/{userId}` - Get user's teams
- `PUT /teams/{id}` - Update team (admin/manager)
- `DELETE /teams/{id}` - Delete team (admin/manager)

**KPIs (Metrics)**
- `GET /kpis` - List KPIs
- `POST /kpis` - Create KPI
- `POST /kpis/compute` - Calculate metrics ad-hoc
- `GET /kpis/{id}/results` - Get KPI results
- `GET /kpis/{id}/export` - Export KPI as PDF

## Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- kpi-api.test.js

# Test coverage
npm test -- --coverage
```

**Current Coverage**: 93.7% (74/79 tests passing)
- `kpi-api.test.js`: 48 tests (100% passing)
- `kpi.test.js`: 32 integration tests

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# Run with UI
npm run test:ui

# Run in watch mode
npm run test:run
```

**Current Coverage**: 34.7% (33/95 tests passing)
- Component rendering and data initialization
- User interactions and state changes
- Chart integration and export functionality

## Project Structure

```
Time-Manager/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── routes/          # API route definitions (Auth, Users, Clocks, etc.)
│   ├── middleware/      # Authentication, validation
│   ├── validators/      # Request validation schemas
│   ├── prisma/          # Database schema & migrations
│   ├── docs/            # Swagger OpenAPI specification
│   ├── test/            # Jest test suites
│   ├── config/          # Swagger setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Vue components (Chrono, ClocksTable, etc.)
│   │   ├── pages/       # Page components (Dashboard, Teams, etc.)
│   │   ├── services/    # API service classes
│   │   ├── router/      # Vue Router configuration
│   │   ├── assets/      # CSS and static files
│   │   └── test/        # Vitest test suites
│   ├── vite.config.js
│   └── package.json
│
├── nginx/               # Nginx reverse proxy config
├── docker-compose.yml   # Docker services orchestration
└── README.md
```

## Role-Based Permissions

### Admin
- Full access to all features
- Can create/manage users and teams
- Can create/edit/delete planning for anyone
- Can view all KPIs

### Manager
- Can manage their assigned teams
- Can view/edit planning for team members
- Can view team KPIs
- Cannot manage other teams

### Employee
- Can clock in/out
- Can view their own data
- Can view their own KPIs
- Cannot manage teams or planning

## Development Notes

- **Database**: Prisma migrations auto-run on container start
- **Environment Variables**: Set in `backend/.env`
- **Relative API Paths**: Both dev and prod use `/api/*` paths
- **Hot Reload**: Frontend changes reflect instantly in dev mode without rebuilding

## Database Reset

To reset the database (development only):
```bash
# Stop containers
docker compose down

# Remove the data volume
docker volume rm time-manager_db_data

# Restart containers (DB will reinitialize)
docker compose up -d
```

## Troubleshooting

**API docs showing old routes?**
- Rebuild backend: `docker compose build --no-cache backend`
- Restart: `docker compose down && docker compose up -d`

**Database connection issues?**
- Verify MariaDB is running: `docker ps`
- Check logs: `docker logs time-manager-db`

**Frontend not updating?**
- Clear cache: `Ctrl+Shift+Del` (browser) or restart `npm run dev`
- Check Vite proxy in `vite.config.js`

## License

MIT
