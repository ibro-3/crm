# CRM Application

A full-stack Customer Relationship Management (CRM) system built with Django (REST Framework) and React, fully dockerized with PostgreSQL.

## Features

- **Dashboard** - Overview with stats and recent activity
- **Contacts** - Manage customer contact information
- **Leads** - Track leads through pipeline stages (New → Contacted → Qualified → Won/Lost)
- **Deals** - Manage sales opportunities with value tracking
- **Tasks** - Assign and track tasks with priority and status
- **Companies** - Maintain company profiles and associations

## Tech Stack

### Backend
- Django 6.0
- Django REST Framework
- PostgreSQL 16
- Gunicorn (WSGI server)
- Session-based authentication
- CORS headers

### Frontend
- React 19
- Vite 8
- TailwindCSS 4
- React Router DOM 7
- Axios
- Lucide React (icons)

### Infrastructure
- Docker + Docker Compose
- PostgreSQL 16 (Alpine)
- Nginx (serves frontend + proxies API)

## Project Structure

```
crm/
├── backend/
│   ├── crm/                  # Django project settings
│   │   ├── settings.py       # Configuration
│   │   ├── urls.py           # API routes
│   │   └── auth/             # Custom auth views
│   ├── crm_contacts/        # Contacts app
│   ├── crm_leads/           # Leads app
│   ├── crm_deals/           # Deals app
│   ├── crm_tasks/           # Tasks app
│   ├── crm_companies/       # Companies app
│   ├── Dockerfile           # Backend container
│   ├── wait-for-db.sh       # DB readiness check
│   ├── .env                 # Environment variables
│   └── manage.py            # Django CLI
├── frontend/
│   ├── src/
│   │   ├── components/      # Layout component
│   │   ├── pages/           # All page components
│   │   ├── services/        # API client
│   │   └── App.jsx          # Routes
│   ├── Dockerfile           # Frontend container
│   ├── nginx.conf           # Nginx config (SPA + proxy)
│   └── package.json
├── docker-compose.yml        # Orchestration
└── .gitignore
```

## Quick Start (Docker)

### Prerequisites
- Docker
- Docker Compose

### Start the Application

```bash
# Clone the repository
git clone <repo-url>
cd crm

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# Django Admin: http://localhost:8000/admin
```

### Stop the Application

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

These are auto-created on first startup. To create a different superuser:

```bash
docker-compose exec backend python manage.py createsuperuser
```

## Environment Variables

### Backend (.env file in backend/)

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm
DB_USER=crmuser
DB_PASSWORD=crmpass

# Other
CSRF_TRUSTED_ORIGINS=
PAGE_SIZE=20
```

For Docker, these are set automatically in `docker-compose.yml`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/auth/user/` | Current user |
| GET/POST | `/api/contacts/` | List/Create contacts |
| GET/PUT/DELETE | `/api/contacts/{id}/` | CRUD contact |
| GET/POST | `/api/leads/` | List/Create leads |
| GET/PUT/DELETE | `/api/leads/{id}/` | CRUD lead |
| GET/POST | `/api/deals/` | List/Create deals |
| GET/PUT/DELETE | `/api/deals/{id}/` | CRUD deal |
| GET/POST | `/api/tasks/` | List/Create tasks |
| GET/PUT/DELETE | `/api/tasks/{id}/` | CRUD task |
| GET/POST | `/api/companies/` | List/Create companies |
| GET/PUT/DELETE | `/api/companies/{id}/` | CRUD company |

### Query Parameters

All list endpoints support:
- `?search=` - Search across fields
- `?page=` - Pagination (default: 20 per page)
- `?ordering=` - Sort by field (prefix with `-` for descending)

Additional filters per endpoint:
- **Leads**: `?stage=`, `?source=`, `?company=`
- **Deals**: `?stage=`, `?company=`, `?contact=`, `?min_value=`, `?max_value=`
- **Tasks**: `?status=`, `?priority=`, `?contact=`, `?deal=`
- **Companies**: `?industry=`

## Development (Without Docker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv ../venv
source ../venv/bin/activate  # Linux/Mac
# or
..\venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure .env with local PostgreSQL
# DB_HOST=localhost
# DB_PORT=5432
# etc.

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Access the application at `http://localhost:5173`

## Admin Panel

Access Django admin at `http://localhost:8000/admin/` for:
- User management
- Data inspection and editing
- Model configuration

## Database

The application uses **PostgreSQL 16** running in a Docker container.

### Access PostgreSQL Shell

```bash
docker-compose exec db psql -U crmuser -d crm
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
```

## Security Features

- Session-based authentication with CSRF protection
- Input validation on all serializers
- Rate limiting on login endpoint
- User-scoped data isolation
- Environment-based configuration
- CORS protection

## Build & Deploy

### Rebuild After Changes

```bash
docker-compose up -d --build
```

### Production Considerations

1. Set `DEBUG=False` in environment
2. Use strong `SECRET_KEY`
3. Configure proper `ALLOWED_HOSTS`
4. Use `psycopg2-binary` instead of `psycopg2` for simpler builds
5. Set up proper PostgreSQL credentials
6. Configure HTTPS with SSL certificates

## Troubleshooting

### Backend can't connect to database
```bash
# Check if PostgreSQL is ready
docker-compose logs db

# Restart backend after db is ready
docker-compose restart backend
```

### Frontend can't reach API
Check that nginx proxy is configured correctly:
```bash
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Reset everything
```bash
docker-compose down -v --rmi all
docker system prune -a
docker-compose up -d --build
```
