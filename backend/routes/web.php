<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

// Named login route to satisfy auth middleware redirects.
// The frontend uses token auth via /api/login.
Route::get('/login', function () {
    return view('app');
})->name('login');

// SPA fallback (exclude API and static assets)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!(api|storage|app|favicon\.ico|manifest\.json)).*$');