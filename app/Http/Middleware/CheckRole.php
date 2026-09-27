<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        // 1. Ensure user is authenticated
        if (!$user) {
            return response()->json([
                'message' => 'غير مصرح، يجب تسجيل الدخول أولاً.'
            ], 401);
        }

        // 2. Ensure user has one of the required roles
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'غير مصرح لك بالوصول إلى هذا القسم (صلاحيات غير كافية).'
            ], 403);
        }

        // 3. Ensure user account is not suspended or deactivated
        if ($user->status && $user->status !== 'active') {
            return response()->json([
                'message' => 'حسابك غير نشط، يرجى مراجعة إدارة المنصة.'
            ], 403);
        }

        return $next($request);
    }
}
