# Laravel Backend - Complete Setup Instructions

## ✅ Completed
- Laravel installed at: `C:\Users\dktakyi001\Desktop\cohort-api`
- Laravel Sanctum installed for API authentication
- Default migrations run (users, cache, jobs, personal_access_tokens tables created)

## 📋 Next Steps

### 1. Configure Database (.env file)

Edit `C:\Users\dktakyi001\Desktop\cohort-api\.env` and change:

```env
# Change from SQLite to MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cohort_enrollment
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# Configure CORS for frontend
FRONTEND_URL=http://localhost:5173

# Sanctum configuration
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost
```

### 2. Create MySQL Database

```sql
CREATE DATABASE cohort_enrollment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Add HasApiTokens Trait to User Model

Edit `C:\Users\dktakyi001\Desktop\cohort-api\app\Models\User.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Add this

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens; // Add HasApiTokens here

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // Add custom fields
        'phone',
        'bio',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
}
```

### 4. Configure CORS

Edit `C:\Users\dktakyi001\Desktop\cohort-api\config\cors.php`:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 5. I'll create migration files for you in the next message

See the migration files in the `docs/laravel-migrations/` folder.

### 6. After creating migrations, run:

```powershell
cd C:\Users\dktakyi001\Desktop\cohort-api
php artisan migrate
```

### 7. Start Laravel Server

```powershell
cd C:\Users\dktakyi001\Desktop\cohort-api
php artisan serve --port=8000
```

Your Laravel API will be available at: `http://localhost:8000/api`

## ✨ Summary

- ✅ React frontend fully migrated to Laravel API
- ✅ Axios installed and used for all API calls
- ✅ Laravel backend created with Sanctum auth
- 📝 Next: Final testing and deployment
