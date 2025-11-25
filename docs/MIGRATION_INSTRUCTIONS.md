# Laravel Migration Files - Copy Instructions

All migration files have been created in Laravel at:
`C:\Users\dktakyi001\Desktop\cohort-api\database\migrations\`

## Step-by-Step Instructions

### 1. Copy Migration Contents

For each migration file below, **copy the entire content** from this folder:
`docs/laravel-migrations/`

And paste it into the corresponding file in:
`C:\Users\dktakyi001\Desktop\cohort-api\database\migrations\`

### Migration Files Mapping

| File in docs/laravel-migrations/ | Paste into cohort-api/database/migrations/ |
|----------------------------------|-------------------------------------------|
| `add_custom_fields_to_users_table.php` | `2025_11_21_040217_add_custom_fields_to_users_table.php` |
| `create_courses_table.php` | `2025_11_21_040218_create_courses_table.php` |
| `create_course_modules_table.php` | `2025_11_21_040218_create_course_modules_table.php` |
| `create_course_sessions_table.php` | `2025_11_21_040219_create_course_sessions_table.php` |
| `create_enrollments_table.php` | `2025_11_21_040220_create_enrollments_table.php` |
| `create_payments_table.php` | `2025_11_21_040221_create_payments_table.php` |
| `create_assignments_table.php` | `2025_11_21_040230_create_assignments_table.php` |
| `create_submissions_table.php` | `2025_11_21_040230_create_submissions_table.php` |
| `create_submission_files_table.php` | `2025_11_21_040231_create_submission_files_table.php` |
| `create_grades_table.php` | `2025_11_21_040232_create_grades_table.php` |
| `create_resources_table.php` | `2025_11_21_040232_create_resources_table.php` |
| `create_certificates_table.php` | `2025_11_21_040233_create_certificates_table.php` |
| `create_announcements_table.php` | `2025_11_21_040234_create_announcements_table.php` |
| `create_messages_table.php` | `2025_11_21_040235_create_messages_table.php` |

### 2. Configure Database

Edit `C:\Users\dktakyi001\Desktop\cohort-api\.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cohort_enrollment
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

### 3. Create Database

Run in MySQL:
```sql
CREATE DATABASE cohort_enrollment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Migrations

```powershell
cd C:\Users\dktakyi001\Desktop\cohort-api
php artisan migrate
```

This will create all 14 tables:
- users (with custom fields)
- courses
- course_modules
- course_sessions  
- enrollments
- payments
- assignments
- submissions
- submission_files
- grades
- resources
- certificates
- announcements
- messages

## Database Schema Summary

### Core Tables
- **users** - Extended with role, phone, bio, avatar_url, full_name
- **courses** - Main course table with pricing, status, enrollment tracking
- **course_modules** - Course content organization
- **course_sessions** - Live/scheduled class sessions

### Enrollment & Payments
- **enrollments** - Student course registrations with payment status
- **payments** - Paystack payment records

### Assignments & Grading
- **assignments** - Course assignments
- **submissions** - Student assignment submissions
- **submission_files** - Files attached to submissions
- **grades** - Grading and feedback

### Resources & Communication
- **resources** - Course materials (files, links, videos)
- **certificates** - Course completion certificates
- **announcements** - Course announcements
- **messages** - Direct messaging between users

## Next Steps After Migration

1. ✅ Add `HasApiTokens` trait to User model
2. ✅ Configure CORS in `config/cors.php`
3. ✅ Create API controllers (Auth, Courses, Enrollments, etc.)
4. ✅ Update React frontend to use Laravel API
5. ✅ Set up file storage for thumbnails
