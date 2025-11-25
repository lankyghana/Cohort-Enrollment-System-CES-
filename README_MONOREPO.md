# Cohort Enrollment System - Monorepo

This project is now structured as a monorepo with both frontend and backend in one repository.

## Project Structure

```
Cohort Website Project/
├── backend/                    # Laravel 11 API
│   ├── app/                   # Controllers, Models
│   ├── database/              # Migrations, SQLite DB
│   ├── routes/                # API routes
│   └── .env                   # Laravel configuration
│
├── src/                       # React + TypeScript frontend
├── public/                    # Static assets
├── docs/                      # Documentation
└── package.json              # Frontend dependencies
```

## Getting Started

### 1. Start the Backend (Laravel API)

```powershell
cd backend
php artisan serve
```
Backend runs on: **http://localhost:8000**

### 2. Start the Frontend (React + Vite)

Open a new terminal:
```powershell
npm run dev
```
Frontend runs on: **http://localhost:5173**

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite 5.4
- TailwindCSS
- Zustand (state management)
- Axios (HTTP client)

### Backend
- Laravel 11
- Laravel Sanctum (authentication)
- SQLite database
- RESTful API

## API Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get authenticated user
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (instructors only)
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

## Database

The Laravel backend uses SQLite for easy development:
- Location: `backend/database/database.sqlite`
- 18 tables (users, courses, enrollments, payments, etc.)

To run migrations:
```powershell
cd backend
php artisan migrate
```

## Development Workflow

1. Both servers should be running simultaneously
2. Frontend makes API calls to `http://localhost:8000/api`
3. Authentication uses Bearer tokens stored in localStorage
4. CORS is configured to allow frontend access

## Next Steps

- [ ] Implement course management API integration
- [ ] Add file upload for course thumbnails
- [ ] Migrate admin pages to Laravel API
- [ ] Implement sessions/scheduling API
- [ ] Add enrollment and payment processing
