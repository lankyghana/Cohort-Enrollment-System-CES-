<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveEnrollment
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && method_exists($user, 'isStudent') && $user->isStudent()) {
            $status = (string) ($user->status ?? 'active');
            $hasActive = (bool) ($user->has_active_enrollment ?? false);

            if ($status !== 'active' || ! $hasActive) {
                return response()->json([
                    'message' => 'Continue your enrollment to access this page.',
                    'next_step' => 'select-course',
                ], 403);
            }
        }

        return $next($request);
    }
}
