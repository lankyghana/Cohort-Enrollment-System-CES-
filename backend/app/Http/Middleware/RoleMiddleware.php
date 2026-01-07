<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * @param  array<int, string>  $roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $userRole = (string) ($user->role ?? '');
        $allowed = collect($roles)
            ->flatMap(fn ($r) => explode(',', (string) $r))
            ->map(fn ($r) => trim((string) $r))
            ->filter()
            ->values()
            ->all();

        if (! in_array($userRole, $allowed, true)) {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }

        return $next($request);
    }
}
