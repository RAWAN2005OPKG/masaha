<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Space;
use Carbon\Carbon;

class CheckSpaceSubscription
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Admins can bypass subscription checks
        if (!$user || $user->role === 'admin') {
            return $next($request);
        }

        // If user is owner or staff under an owner
        if ($user->role === 'owner' || $user->role === 'receptionist') {
            $space = null;
            if ($user->role === 'owner') {
                $space = Space::where('user_id', $user->id)->first();
            } else {
                // receptionist associated with an owner or space
                $space = Space::where('user_id', $user->owner_id)->first() ?? Space::first();
            }

            if ($space) {
                $today = Carbon::today();
                $startDate = $space->sub_start_date ? Carbon::parse($space->sub_start_date)->startOfDay() : null;
                $endDate = $space->sub_end_date ? Carbon::parse($space->sub_end_date)->startOfDay() : null;

                // 1. Not started yet
                if ($startDate && $today->lt($startDate)) {
                    return response()->json([
                        'error' => 'subscription_pending',
                        'message' => 'طلبك قيد المراجعة / لم يحن موعد بدء اشتراكك بعد. سيبدأ اشتراكك بتاريخ ' . $startDate->format('Y/m/d') . '.',
                        'start_date' => $startDate->format('Y-m-d'),
                    ], 403);
                }

                // 2. Expired
                if ($endDate && $today->gt($endDate)) {
                    return response()->json([
                        'error' => 'subscription_expired',
                        'message' => 'انتهت فترة اشتراكك بتاريخ ' . $endDate->format('Y/m/d') . '. لا يمكنك الوصول للوحة التحكم، يرجى التواصل مع الإدارة لتجديد الاشتراك.',
                        'end_date' => $endDate->format('Y-m-d'),
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
