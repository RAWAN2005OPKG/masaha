<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class AdminController extends Controller
{
    public function dashboardStats()
    {
        $totalUsers = User::where('role', 'user')->count();

        // Calculate user growth percentage this month compared to last month
        $currentMonthCount = User::where('role', 'user')
                                 ->whereMonth('created_at', now()->month)
                                 ->whereYear('created_at', now()->year)
                                 ->count();

        $lastMonthCount = User::where('role', 'user')
                              ->whereMonth('created_at', now()->subMonth()->month)
                              ->whereYear('created_at', now()->subMonth()->year)
                              ->count();

        if ($lastMonthCount == 0) {
            $growth = $currentMonthCount > 0 ? 100 : 0;
        } else {
            $growth = (($currentMonthCount - $lastMonthCount) / $lastMonthCount) * 100;
        }

        // Real active bookings
        $activeBookings = \App\Models\Booking::where('status', 'confirmed')
            ->whereNull('check_out_time')
            ->count();
        if ($activeBookings === 0) {
            $activeBookings = \App\Models\Booking::whereIn('status', ['confirmed', 'completed'])->count();
        }

        // Open spaces
        $totalSpaces = \App\Models\Space::count();
        $openSpaces = \App\Models\Space::where('is_manual_disabled', false)->count();
        $openSpacesText = "{$openSpaces}/{$totalSpaces}";

        // Monthly revenue
        $monthlyRevenue = (float)\App\Models\Booking::whereIn('status', ['confirmed', 'completed'])
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_price');

        if ($monthlyRevenue == 0) {
            $monthlyRevenue = (float)\App\Models\Booking::whereIn('status', ['confirmed', 'completed'])->sum('total_price');
        }

        // Notifications for admin (from notifications table)
        $notifications = \App\Models\Notification::orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(function ($n) {
                $color = 'bg-blue-500';
                if ($n->type === 'emergency' || $n->type === 'danger') $color = 'bg-red-500';
                elseif ($n->type === 'warning') $color = 'bg-amber-500';
                elseif ($n->type === 'success' || $n->type === 'wifi') $color = 'bg-emerald-500';

                $body = $n->desc ?: $n->message;
                return [
                    'id' => $n->id,
                    'text' => $n->title . ($body ? ' - ' . $body : ''),
                    'time' => $n->created_at ? $n->created_at->diffForHumans() : 'الآن',
                    'color' => $color,
                ];
            });

        return response()->json([
            'total_users' => $totalUsers,
            'users_growth' => round($growth, 1),
            'active_bookings' => $activeBookings,
            'open_spaces' => $openSpacesText,
            'monthly_revenue' => '₪' . number_format($monthlyRevenue),
            'monthly_revenue_raw' => $monthlyRevenue,
            'notifications' => $notifications,
        ]);
    }

    public function reports()
    {
        $totalRevenue = (float)\App\Models\Booking::whereIn('status', ['confirmed', 'completed'])->sum('total_price');
        $totalBookings = \App\Models\Booking::count();
        $monthlyEvents = \App\Models\Event::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Dynamic peak hours
        if ($totalBookings === 0) {
            $peakHoursText = 'لا توجد بيانات بعد';
        } else {
            $morn = \App\Models\Booking::whereRaw('HOUR(created_at) >= 8 AND HOUR(created_at) < 12')->count();
            $aft = \App\Models\Booking::whereRaw('HOUR(created_at) >= 12 AND HOUR(created_at) < 16')->count();
            $eve = \App\Models\Booking::whereRaw('HOUR(created_at) >= 16 AND HOUR(created_at) <= 22')->count();
            
            if ($morn >= $aft && $morn >= $eve && $morn > 0) {
                $peakHoursText = '8ص - 12م';
            } elseif ($aft >= $morn && $aft >= $eve && $aft > 0) {
                $peakHoursText = '12م - 4م';
            } elseif ($eve > 0) {
                $peakHoursText = '4م - 8م';
            } else {
                $peakHoursText = 'لا توجد بيانات بعد';
            }
        }

        // 6-month revenue trend
        $months = [];
        $arabicMonths = [
            1 => 'يناير', 2 => 'فبراير', 3 => 'مارس', 4 => 'أبريل',
            5 => 'مايو', 6 => 'يونيو', 7 => 'يوليو', 8 => 'أغسطس',
            9 => 'سبتمبر', 10 => 'أكتوبر', 11 => 'نوفمبر', 12 => 'ديسمبر'
        ];

        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthNum = (int)$date->format('n');
            $yearNum = (int)$date->format('Y');

            $rev = (float)\App\Models\Booking::whereIn('status', ['confirmed', 'completed'])
                ->whereMonth('created_at', $monthNum)
                ->whereYear('created_at', $yearNum)
                ->sum('total_price');

            $months[] = [
                'month' => $arabicMonths[$monthNum],
                'revenue' => (int)$rev,
            ];
        }

        // Weekly bookings trend
        $daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
        $weeklyData = [];
        foreach ($daysOfWeek as $index => $day) {
            $cnt = \App\Models\Booking::whereRaw('DAYOFWEEK(created_at) = ?', [$index + 1])->count();
            $weeklyData[] = [
                'day' => $day,
                'value' => (int)$cnt,
            ];
        }

        // Services breakdown from seat_type across all bookings
        $allSeatCounts = \App\Models\Booking::selectRaw('seat_type, count(*) as total')
            ->groupBy('seat_type')
            ->pluck('total', 'seat_type');

        $totalPlatformBookings = $allSeatCounts->sum();
        $palette = ['#14B8A6', '#22D3EE', '#EC4899', '#8B5CF6', '#F59E0B'];
        $servicesData = [];
        $pIdx = 0;

        if ($totalPlatformBookings > 0) {
            foreach ($allSeatCounts as $type => $count) {
                $servicesData[] = [
                    'name' => $type ?: 'مقعد عام',
                    'value' => (int)round(($count / $totalPlatformBookings) * 100),
                    'color' => $palette[$pIdx % count($palette)],
                ];
                $pIdx++;
            }
        }

        return response()->json([
            'total_revenue' => '₪' . number_format($totalRevenue),
            'total_bookings' => number_format($totalBookings),
            'peak_hours' => $peakHoursText,
            'monthly_events' => (string)$monthlyEvents,
            'revenue_data' => $months,
            'weekly_data' => $weeklyData,
            'services_data' => $servicesData,
        ]);
    }

    public function getUsers()
    {
        $hasBirthDate = \Illuminate\Support\Facades\Schema::hasColumn('users', 'birth_date');
        $hasLastActivity = \Illuminate\Support\Facades\Schema::hasColumn('users', 'last_activity_at');

        $users = User::where('role', 'user') // Only fetch normal users, exclude admins and owners
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) use ($hasBirthDate, $hasLastActivity) {
                // Check if avatar is full URL, otherwise assume storage
                $avatarUrl = $user->avatar 
                    ? (filter_var($user->avatar, FILTER_VALIDATE_URL) ? $user->avatar : asset('storage/' . $user->avatar)) 
                    : null;

                // Real-time online activity check (Within last 2 minutes = Online)
                $isOnline = false;
                $lastSeen = 'لم يتصل بعد';
                if ($hasLastActivity && $user->last_activity_at) {
                    $lastAct = \Carbon\Carbon::parse($user->last_activity_at);
                    if ($lastAct->gte(now()->subMinutes(2))) {
                        $isOnline = true;
                        $lastSeen = 'متواجد الآن';
                    } else {
                        $lastSeen = 'آخر ظهور ' . $lastAct->diffForHumans();
                    }
                }

                $status = $isOnline ? 'نشط' : 'غير نشط';

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $status,
                    'is_online' => $isOnline,
                    'last_seen' => $lastSeen,
                    'birth_date' => ($hasBirthDate && $user->birth_date) ? \Carbon\Carbon::parse($user->birth_date)->format('Y-m-d') : null,
                    'role' => $user->role,
                    'avatar' => $avatarUrl,
                    'joinDate' => $user->created_at ? $user->created_at->format('Y-m-d') : 'غير معروف',
                    'rating' => $user->rating ? (float)$user->rating : null, // Dynamic rating
                ];
            });

        return response()->json($users);
    }
}
