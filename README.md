# CRM Application

A full-stack Customer Relationship Management (CRM) system built with Django (REST Framework) and React.

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
- SQLite (development)
- Session-based authentication
- CORS headers

### Frontend
- React 19
- Vite 8
- TailwindCSS 4
- React Router DOM 7
- Axios
- Lucide React (icons)

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
│   ├── .env                 # Environment variables
│   └── manage.py            # Django CLI
├── frontend/
│   ├── src/
│   │   ├── components/      # Layout component
│   │   ├── pages/           # All page components
│   │   ├── services/        # API client
│   │   └── App.jsx          # Routes
│   └── package.json
└── venv/                   # Python virtual environment
```

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Create and activate virtual environment:
```bash
cd backend
python -m venv ../venv
source ../venv/bin/activate  # Linux/Mac
# or
..\venv\Scripts\activate     # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Create superuser:
```bash
python manage.py createsuperuser
```

5. Start server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

## Configuration

### Environment Variables (Backend)

Create `.env` file in `backend/` directory:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
PAGE_SIZE=20
```

### API Endpoints

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

## Default Credentials

- Username: `admin`
- Password: `admin123`

## Admin Panel

Access Django admin at `http://localhost:8000/admin/` for:
- User management
- Data inspection and editing
- Model configuration

## Development

```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application at `http://localhost:5173`

## Security Features

- Session-based authentication with CSRF protection
- Input validation on all serializers
- Rate limiting on login endpoint
- User-scoped data isolation
- Environment-based configuration