# Cohort Enrollment Platform API (Backend)

This folder contains the Laravel backend used by the Cohort Enrollment Platform.

## Tech Stack

- Laravel 12.x
- PHP 8.2+
- Database: SQLite (default for local/dev) or MySQL
- Queue: database-driven by default (Redis/SQS supported via configuration)

## Prerequisites

- PHP 8.2+ and Composer
- (Optional) MySQL if you don’t want to use SQLite

## Local Setup

From the `backend/` directory:

```bash
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
```

### Database configuration

By default, the project uses SQLite.

- SQLite file path is configured via `DB_DATABASE` (see `.env.example`).
- To switch to MySQL, set `DB_CONNECTION=mysql` and provide `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.

### Queue configuration

Database-driven queues are enabled by default:

- `QUEUE_CONNECTION=database`
- `QUEUE_FAILED_DRIVER=database-uuids`

The required tables (`jobs`, `job_batches`, `failed_jobs`) are created via the included migrations.

To run a worker locally:

```bash
php artisan queue:work
```

## Running the Backend

Start the API server:

```bash
php artisan serve
```

The API will be available at:

- http://127.0.0.1:8000

## Monorepo Note

In this repository, the React frontend lives at the repo root and is run separately (Vite on :5173). For local dev, you typically run:

- Backend: `php artisan serve`
- Frontend (repo root): `npm run dev`

