<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Compatibility for older MySQL/MariaDB setups (common on shared hosting)
        // where utf8mb4 indexes with 255-length strings can exceed key limits.
        Schema::defaultStringLength(191);
    }
}
