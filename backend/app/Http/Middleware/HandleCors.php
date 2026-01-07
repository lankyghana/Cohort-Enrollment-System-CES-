<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Arr;

class HandleCors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $origin = $request->headers->get('Origin');
        $allowedOrigins = config('cors.allowed_origins', []);
        if (is_string($allowedOrigins)) {
            $allowedOrigins = array_filter(array_map('trim', explode(',', $allowedOrigins)));
        }

        $allowOrigin = null;
        if ($origin && in_array($origin, $allowedOrigins, true)) {
            $allowOrigin = $origin;
        }

        $headers = [
            'Access-Control-Allow-Origin'      => $allowOrigin,
            'Access-Control-Allow-Methods'     => 'POST, GET, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Max-Age'           => '86400',
            'Access-Control-Allow-Headers'     => 'Content-Type, Authorization, X-Requested-With',
            'Vary'                             => 'Origin',
        ];

        // If the origin isn't allowed, omit the header (browser will block).
        $headers = Arr::where($headers, fn ($value) => $value !== null);

        if ($request->isMethod('OPTIONS'))
        {
            return response()->json('{"method":"OPTIONS"}', 200, $headers);
        }

        $response = $next($request);
        foreach($headers as $key => $value)
        {
            $response->header($key, $value);
        }

        return $response;
    }
}
