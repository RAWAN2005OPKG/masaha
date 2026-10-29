<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $user = $request->user();
        if ($user) {
            // Update last_activity_at if older than 1 minute to prevent constant DB writes
            $lastActivity = $user->last_activity_at;
            if (!$lastActivity || \Carbon\Carbon::parse($lastActivity)->diffInSeconds(now()) >= 60) {
                try {
                    $user->update(['last_activity_at' => now()]);
                } catch (\Throwable $e) {
                    // Ignore DB errors if migration not yet applied
                }
            }
        }

        return $response;
    }
}
