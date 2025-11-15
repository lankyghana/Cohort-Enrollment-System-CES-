# Architecture Documentation

## Overview

The Cohort Enrollment Platform is built using a modern serverless architecture with React on the frontend and Supabase as the backend-as-a-service platform.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React SPA (Vite)                                    │   │
│  │  - React Router (Routing)                            │   │
│  │  - Zustand (State Management)                        │   │
│  │  - Tailwind CSS (Styling)                            │   │
│  │  - React Hook Form (Forms)                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth       │  │  PostgreSQL  │  │   Storage    │     │
│  │              │  │  Database    │  │              │     │
│  │ - Email Auth │  │ - RLS        │  │ - Files      │     │
│  │ - Sessions   │  │ - Triggers   │  │ - Certificates│    │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Realtime   │  │ Edge Functions│                       │
│  │              │  │              │                        │
│  │ - Subscriptions│ │ - Payment   │                        │
│  │ - Notifications│ │   Verification│                      │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Paystack   │  │ Email Service│                        │
│  │              │  │              │                        │
│  │ - Payments   │  │ - Notifications│                      │
│  │ - Webhooks   │  │ - Templates  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **Recharts** - Data visualization for dashboards
- **jsPDF** - PDF generation for certificates
- **Lucide React** - Icon library

### Backend

- **Supabase** - Backend-as-a-Service
  - **PostgreSQL** - Relational database
  - **Supabase Auth** - Authentication service
  - **Supabase Storage** - File storage
  - **Supabase Realtime** - Real-time subscriptions
  - **Edge Functions** - Serverless functions

### Integrations

- **Paystack** - Payment processing
- **Email Service** - Transactional emails (via Supabase)

## Database Schema

### Core Tables

1. **users** - User profiles and roles
2. **courses** - Course information
3. **course_modules** - Course modules/lessons
4. **course_sessions** - Live session scheduling
5. **enrollments** - Student course enrollments
6. **payments** - Payment transactions
7. **resources** - Course materials
8. **certificates** - Completion certificates
9. **announcements** - Platform announcements
10. **messages** - User messaging

### Relationships

```
users (1) ──< (many) courses (instructor_id)
users (1) ──< (many) enrollments (student_id)
courses (1) ──< (many) enrollments
courses (1) ──< (many) course_modules
courses (1) ──< (many) course_sessions
courses (1) ──< (many) resources
enrollments (1) ──< (1) payments
enrollments (1) ──< (many) certificates
```

## Security Architecture

### Row-Level Security (RLS)

All tables have RLS enabled with policies that enforce:

- **Users** can only view/update their own profile
- **Admins** can view/update all users
- **Courses** are publicly viewable when published
- **Enrollments** are only visible to the student and admins
- **Payments** are only visible to the student and admins
- **Resources** are only accessible to enrolled students
- **Certificates** are only visible to the student and admins

### Authentication Flow

1. User registers/logs in via Supabase Auth
2. Supabase creates session and JWT token
3. JWT token is stored in browser (httpOnly cookie)
4. Token is sent with every API request
5. Supabase validates token and applies RLS policies

### Payment Security

1. Payment initiated on client with Paystack
2. Paystack processes payment
3. Webhook sent to Supabase Edge Function
4. Edge Function verifies payment with Paystack API
5. Only verified payments update enrollment status

## State Management

### Zustand Stores

- **authStore** - Authentication state and user profile
- Future stores for:
  - Course data caching
  - Notification state
  - UI state (modals, sidebars)

### React Context

- Used sparingly for deeply nested component communication
- Prefer Zustand for global state

## Routing Structure

### Public Routes
- `/` - Landing page
- `/courses` - Course catalog
- `/courses/:id` - Course details
- `/login` - Login page
- `/register` - Registration page
- `/verify-email` - Email verification
- `/reset-password` - Password reset

### Protected Routes (Student)
- `/dashboard` - Student dashboard
- `/dashboard/courses` - My courses
- `/dashboard/courses/:id` - Course dashboard
- `/dashboard/courses/:id/session/:sessionId` - Live session
- `/dashboard/courses/:id/resources` - Resources
- `/dashboard/certificates` - Certificates
- `/dashboard/profile` - Profile settings

### Protected Routes (Admin)
- `/admin` - Admin dashboard
- `/admin/courses` - Course management
- `/admin/courses/new` - Create course
- `/admin/courses/:id/edit` - Edit course
- `/admin/students` - Student management
- `/admin/payments` - Payment management
- `/admin/schedule` - Schedule management
- `/admin/certificates` - Certificate management

## File Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # Base UI components
│   ├── layouts/        # Layout components
│   └── auth/           # Auth-related components
├── pages/              # Page components
│   ├── public/         # Public pages
│   ├── auth/           # Auth pages
│   ├── student/        # Student dashboard pages
│   ├── admin/          # Admin dashboard pages
│   └── errors/         # Error pages
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/              # Zustand stores
├── types/              # TypeScript types
├── utils/              # Utility functions
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## API Patterns

### Supabase Client Usage

```typescript
// Query with RLS
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .eq('status', 'published')

// Insert with RLS
const { data, error } = await supabase
  .from('enrollments')
  .insert({ student_id: userId, course_id: courseId })
```

### Error Handling

All Supabase operations should handle errors:

```typescript
const { data, error } = await supabase.from('table').select()

if (error) {
  console.error('Error:', error.message)
  // Handle error (show toast, etc.)
  return
}

// Use data
```

## Deployment Architecture

### Frontend Deployment (Vercel)

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18+
- **Environment Variables:** Set in Vercel dashboard

### Backend (Supabase)

- Fully managed by Supabase
- Automatic scaling
- Global CDN for static assets
- Edge Functions deployed automatically

## Performance Optimizations

1. **Code Splitting** - React Router lazy loading
2. **Image Optimization** - Supabase Storage with CDN
3. **Caching** - React Query for data caching (future)
4. **Lazy Loading** - Components loaded on demand
5. **Database Indexing** - Optimized queries with indexes

## Monitoring & Logging

- **Supabase Logs** - Database and API logs
- **Browser Console** - Client-side errors
- **Vercel Analytics** - Performance metrics (future)
- **Sentry** - Error tracking (future)

## Future Enhancements

- [ ] React Query for data fetching and caching
- [ ] Service Worker for PWA capabilities
- [ ] Advanced analytics dashboard
- [ ] Real-time chat functionality
- [ ] Mobile app (React Native)

