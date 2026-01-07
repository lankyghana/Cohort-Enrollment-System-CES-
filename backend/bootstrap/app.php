<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // IMPORTANT: API routes must be stateless.
        // Do not include session/CSRF middleware here, otherwise POST requests
        // (e.g. /api/login, /api/register) will fail with 419 CSRF token errors.
        $middleware->api(append: [
            \App\Http\Middleware\HandleCors::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);

        $middleware->web(append: [
            //
        ]);

        $middleware->alias([
            'active.enrollment' => \App\Http\Middleware\EnsureActiveEnrollment::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'course.started' => \App\Http\Middleware\EnsureCourseHasStarted::class,
            'session.course.started' => \App\Http\Middleware\EnsureSessionCourseHasStarted::class,
            'course.balance' => \App\Http\Middleware\EnsureEnrollmentBalanceCleared::class,
            'session.course.balance' => \App\Http\Middleware\EnsureSessionEnrollmentBalanceCleared::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
