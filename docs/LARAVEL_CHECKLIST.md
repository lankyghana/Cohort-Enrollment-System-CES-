# Laravel Setup Checklist

Use this checklist to ensure your Laravel backend setup is complete.

## ✅ Step 1: Environment

- [ ] Navigated to `backend` directory
- [ ] Installed Composer dependencies (`composer install`)
- [ ] Installed NPM dependencies (`npm install`)
- [ ] Created `.env` file from `.env.example`
- [ ] Generated application key (`php artisan key:generate`)
- [ ] Configured `DB_*` variables in `.env`

## ✅ Step 2: Database

- [ ] Created the database in your database client (e.g., MySQL Workbench, TablePlus)
- [ ] Ran migrations (`php artisan migrate`)
- [ ] Verified all tables were created in the database
- [ ] (Optional) Seeded the database (`php artisan db:seed`)

## ✅ Step 3: Server

- [ ] Started the Laravel server (`php artisan serve`)
- [ ] Verified the backend is running at `http://localhost:8000`

## ✅ Step 4: Frontend Configuration

- [ ] Updated the `.env` file in the root of the project (not the `backend` directory)
- [ ] Set `VITE_API_BASE_URL=http://localhost:8000`

## ✅ Step 5: Test Connection

- [ ] Started frontend dev server: `npm run dev`
- [ ] Opened `http://localhost:5173`
- [ ] Checked browser console - no connection errors to the API
- [ ] Verified app loads and can fetch data from the Laravel backend

## 🎉 Setup Complete!

If all items are checked, your Laravel backend setup is complete!


- See [Full Laravel Setup Guide](./LARAVEL_SETUP.md)
- Check [Troubleshooting Section](./LARAVEL_SETUP.md#troubleshooting)
- Review [Laravel Documentation](https://laravel.com/docs)

