<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Space;
use App\Models\Booking;
use App\Models\Notification;
use Carbon\Carbon;

class SpaceController extends Controller
{
    /**
     * Get active spaces for user exploration.
     */
    public function index(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        $today = Carbon::today();

        // Filter and map spaces for user exploration
        $spaces = Space::all()
            ->filter(function ($space) use ($today) {
                // If subscription has ended, hide/remove from user listings completely
                if ($space->sub_end_date) {
                    $endDate = Carbon::parse($space->sub_end_date)->startOfDay();
                    if ($today->gt($endDate)) {
                        return false;
                    }
                }
                return true;
            })
            ->values()
            ->map(function ($space) use ($user, $today) {
                // Auto-reopen: if emergency_until has passed, clear the emergency state
                if ($space->is_manual_disabled && $space->emergency_until && now()->isAfter($space->emergency_until)) {
                    $space->is_manual_disabled = false;
                    $space->emergency_reason   = null;
                    $space->emergency_until    = null;
                    $space->save();
                }

                $isFavorite = false;
                if ($user) {
                    $isFavorite = $space->favoritedBy()->where('user_id', $user->id)->exists();
                }

                $servicesList = [];
                if (!empty($space->services)) {
                    $servicesList = array_values(array_filter(array_map('trim', preg_split('/[،,\n\r]+/', $space->services))));
                }

                $activeCount = Booking::where('space_id', $space->id)
                    ->where('status', 'confirmed')
                    ->whereNull('check_out_time')
                    ->count();

                $totalSeats = (int)$space->total_seats ?: 40;
                $available = max(0, $totalSeats - $activeCount);
                $occupancy = $totalSeats > 0 ? min(100, round(($activeCount / $totalSeats) * 100)) : 0;

                $reviewsCount = $space->reviews()->count();
                $avgRating = $reviewsCount > 0 ? round($space->reviews()->avg('rating'), 1) : 4.9;

                $startDate = $space->sub_start_date ? Carbon::parse($space->sub_start_date)->startOfDay() : null;
                $isComingSoon = $startDate && $today->lt($startDate);

                return [
                    'id'                 => $space->id,
                    'name'               => $space->name,
                    'price'              => (float)$space->price_per_hour,
                    'price_regular'      => (float)$space->price_per_hour,
                    'price_private'      => (float)$space->price_private,
                    'price_room'         => (float)$space->price_room,
                    'region'             => $space->region,
                    'speed'              => $space->internet_speed,
                    'seats'              => $totalSeats,
                    'electricity'        => $space->electricity ?: '24/7',
                    'services'           => $space->services,
                    'servicesList'       => $servicesList,
                    'phone'              => $space->phone,
                    'occupied'           => $activeCount,
                    'available'          => $space->is_manual_disabled ? 0 : $available,
                    'occupancy'          => $occupancy,
                    'rating'             => $avgRating,
                    'ratingCount'        => $reviewsCount,
                    'isFavorite'         => $isFavorite,
                    'is_manual_disabled' => (bool)$space->is_manual_disabled,
                    'emergency_reason'   => $space->emergency_reason,
                    'emergency_until'    => $space->emergency_until ? $space->emergency_until->toIso8601String() : null,
                    'is_coming_soon'     => $isComingSoon,
                    'sub_start_date'     => $startDate ? $startDate->format('Y-m-d') : null,
                    'sub_end_date'       => $space->sub_end_date ? Carbon::parse($space->sub_end_date)->format('Y-m-d') : null,
                ];
            });

        return response()->json($spaces);
    }

    /**
     * Get single space details for user view.
     */
    public function show(Request $request, $id)
    {
        $space = Space::findOrFail($id);
        $user = $request->user('sanctum') ?? $request->user();
        $today = Carbon::today();

        // If subscription is expired, regular users cannot view/book it
        if ($space->sub_end_date && $today->gt(Carbon::parse($space->sub_end_date)->startOfDay())) {
            return response()->json([
                'message' => 'هذه المساحة غير متاحة حالياً بسبب انتهاء فترة الاشتراك.',
                'is_expired' => true
            ], 404);
        }

        $startDate = $space->sub_start_date ? Carbon::parse($space->sub_start_date)->startOfDay() : null;
        $isComingSoon = $startDate && $today->lt($startDate);

        $isFavorite = false;
        if ($user) {
            $isFavorite = $space->favoritedBy()->where('user_id', $user->id)->exists();
        }

        $servicesList = [];
        if (!empty($space->services)) {
            $servicesList = array_values(array_filter(array_map('trim', preg_split('/[،,\n\r]+/', $space->services))));
        }
        if (empty($servicesList)) {
            $servicesList = ['واي فاي فائق', 'كهرباء دائمة', 'مكتب مريح', 'قاعة اجتماعات'];
        }

        $activeCount = Booking::where('space_id', $space->id)
            ->where('status', 'confirmed')
            ->whereNull('check_out_time')
            ->count();

        $totalSeats = (int)$space->total_seats ?: 40;
        $available = max(0, $totalSeats - $activeCount);
        $occupancy = $totalSeats > 0 ? min(100, round(($activeCount / $totalSeats) * 100)) : 0;

        $reviewsCount = $space->reviews()->count();
        $avgRating = $reviewsCount > 0 ? round($space->reviews()->avg('rating'), 1) : 4.9;

        return response()->json([
            'id' => $space->id,
            'name' => $space->name,
            'price' => (float)$space->price_per_hour,
            'price_regular' => (float)$space->price_per_hour,
            'price_private' => (float)$space->price_private,
            'price_room' => (float)$space->price_room,
            'region' => $space->region,
            'speed' => $space->internet_speed ?: '100 Mbps',
            'seats' => $totalSeats,
            'electricity' => $space->electricity ?: '24/7',
            'services' => $space->services,
            'servicesList' => $servicesList,
            'phone' => $space->phone,
            'occupied' => $activeCount,
            'available' => $space->is_manual_disabled ? 0 : $available,
            'occupancy' => $occupancy,
            'rating' => $avgRating,
            'ratingCount' => $reviewsCount,
            'isFavorite' => $isFavorite,
            'is_manual_disabled' => (bool)$space->is_manual_disabled,
            'emergency_reason' => $space->emergency_reason,
            'is_coming_soon' => $isComingSoon,
            'sub_start_date' => $startDate ? $startDate->format('Y-m-d') : null,
            'sub_end_date' => $space->sub_end_date ? Carbon::parse($space->sub_end_date)->format('Y-m-d') : null,
        ]);
    }

    public function toggleFavorite(Request $request, $id)
    {
        $space = Space::findOrFail($id);
        $user = $request->user();

        $isFavorite = $space->favoritedBy()->where('user_id', $user->id)->exists();

        if ($isFavorite) {
            $space->favoritedBy()->detach($user->id);
            return response()->json(['status' => 'removed']);
        } else {
            $space->favoritedBy()->attach($user->id);
            return response()->json(['status' => 'added']);
        }
    }

    public function userFavorites(Request $request)
    {
        $favorites = $request->user()->favorites()->get()->map(function($space) {
             return [
                 'id' => $space->id,
                 'name' => $space->name
             ];
        });
        return response()->json($favorites);
    }

    // ==========================================
    // ADMIN SPACE MANAGEMENT METHODS
    // ==========================================

    /**
     * Get all spaces for admin management.
     */
    public function adminIndex()
    {
        $spaces = Space::with('owner')->orderBy('id', 'desc')->get()->map(function ($space) {
            $status = 'مفتوحة';
            if ($space->is_manual_disabled) {
                $status = 'معطلة';
            } elseif ($space->sub_end_date && Carbon::parse($space->sub_end_date)->isPast()) {
                $status = 'منتهي الاشتراك';
            }

            $amenities = [];
            if (!empty($space->services)) {
                $amenities = array_values(array_filter(array_map('trim', preg_split('/[،,\n\r]+/', $space->services))));
            }
            if (empty($amenities)) {
                $amenities = ['واي فاي فائق', 'مكاتب مجهزة'];
            }

            $totalSeats = (int)$space->total_seats;
            // Static occupancy calculation as requested (kept as is)
            $occupied = round($totalSeats * 0.7);

            return [
                'id' => $space->id,
                'name' => $space->name,
                'category' => $space->region ?: 'غزة',
                'region' => $space->region ?: 'غزة',
                'price' => (float)$space->price_per_hour,
                'price_regular' => (float)$space->price_per_hour,
                'price_private' => (float)$space->price_private,
                'price_room' => (float)$space->price_room,
                'seats' => $totalSeats,
                'total' => $totalSeats,
                'occupied' => $occupied,
                'speed' => (int)filter_var($space->internet_speed, FILTER_SANITIZE_NUMBER_INT) ?: 100,
                'power' => $space->electricity ?: 'مولد احتياطي',
                'amenities' => $amenities,
                'services' => $space->services ?: '',
                'status' => $status,
                'is_manual_disabled' => (bool)$space->is_manual_disabled,
                'owner' => $space->owner ? [
                    'id' => $space->owner->id,
                    'name' => $space->owner->name,
                    'email' => $space->owner->email,
                ] : null,
            ];
        });

        return response()->json($spaces);
    }

    /**
     * Get single space for admin edit.
     */
    public function adminShow($id)
    {
        $space = Space::with('owner')->findOrFail($id);

        $status = 'مفتوحة';
        if ($space->is_manual_disabled) {
            $status = 'معطلة';
        } elseif ($space->sub_end_date && Carbon::parse($space->sub_end_date)->isPast()) {
            $status = 'منتهي الاشتراك';
        }

        $amenities = [];
        if (!empty($space->services)) {
            $amenities = array_values(array_filter(array_map('trim', preg_split('/[،,\n\r]+/', $space->services))));
        }

        return response()->json([
            'id' => $space->id,
            'name' => $space->name,
            'category' => $space->region ?: 'غزة',
            'region' => $space->region ?: 'غزة',
            'price' => (float)$space->price_per_hour,
            'price_regular' => (float)$space->price_per_hour,
            'price_private' => (float)$space->price_private,
            'price_room' => (float)$space->price_room,
            'seats' => (int)$space->total_seats,
            'speed' => (int)filter_var($space->internet_speed, FILTER_SANITIZE_NUMBER_INT) ?: 100,
            'power' => $space->electricity ?: 'مولد احتياطي',
            'amenities' => implode('، ', $amenities),
            'services' => $space->services ?: '',
            'status' => $status,
            'is_manual_disabled' => (bool)$space->is_manual_disabled,
        ]);
    }

    /**
     * Update space from admin panel.
     */
    public function adminUpdate(Request $request, $id)
    {
        $space = Space::findOrFail($id);

        $request->validate([
            'name' => 'required|string',
            'category' => 'nullable|string',
            'region' => 'nullable|string',
            'price' => 'nullable|numeric',
            'price_regular' => 'nullable|numeric',
            'price_private' => 'nullable|numeric',
            'price_room' => 'nullable|numeric',
            'seats' => 'nullable|numeric',
            'speed' => 'nullable',
            'power' => 'nullable|string',
            'amenities' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $space->name = $request->name;
        $space->region = $request->category ?? $request->region ?? $space->region;
        if ($request->has('price')) {
            $space->price_per_hour = $request->price;
        } elseif ($request->has('price_regular')) {
            $space->price_per_hour = $request->price_regular;
        }
        if ($request->has('price_private')) {
            $space->price_private = $request->price_private;
        }
        if ($request->has('price_room')) {
            $space->price_room = $request->price_room;
        }
        if ($request->has('seats')) {
            $space->total_seats = $request->seats;
        }
        if ($request->has('speed')) {
            $space->internet_speed = (string)$request->speed;
        }
        if ($request->has('power')) {
            $space->electricity = $request->power;
        }
        if ($request->has('services')) {
            $space->services = $request->services;
        } elseif ($request->has('amenities')) {
            $space->services = $request->amenities;
        }
        if ($request->has('status')) {
            $space->is_manual_disabled = ($request->status === 'معطلة');
        }

        $space->save();

        return response()->json([
            'message' => 'تم حفظ تعديلات المساحة بنجاح',
            'space' => $space
        ]);
    }

    /**
     * Toggle active/disabled status from admin panel.
     */
    public function adminToggleStatus($id)
    {
        $space = Space::findOrFail($id);
        $space->is_manual_disabled = !$space->is_manual_disabled;
        $space->save();

        return response()->json([
            'message' => $space->is_manual_disabled ? 'تم تعطيل المساحة' : 'تم تفعيل المساحة',
            'is_manual_disabled' => $space->is_manual_disabled,
            'status' => $space->is_manual_disabled ? 'معطلة' : 'مفتوحة'
        ]);
    }

    /**
     * Delete space.
     */
    public function adminDestroy($id)
    {
        $space = Space::findOrFail($id);
        
        // Delete all related data to avoid foreign key constraint errors
        \App\Models\Notification::where('space_id', $space->id)->delete();
        $space->reviews()->delete();
        $space->bookings()->delete();
        $space->events()->delete();
        $space->offers()->delete();
        
        $space->delete();

        return response()->json(['message' => 'تم حذف المساحة بنجاح']);
    }

    // ==========================================
    // OWNER SPACE & EMERGENCY METHODS
    // ==========================================

    /**
     * Get space belonging to the logged in owner.
     */
    public function ownerSpace(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        $space = ($user ? Space::where('user_id', $user->id)->first() : null) ?? Space::first();

        if (!$space) {
            return response()->json(['message' => 'لم يتم العثور على مساحة'], 404);
        }

        return response()->json([
            'id' => $space->id,
            'name' => $space->name,
            'is_closed' => (bool)$space->is_manual_disabled,
            'is_manual_disabled' => (bool)$space->is_manual_disabled,
            'emergency_reason' => $space->emergency_reason,
            'emergency_until' => $space->emergency_until ? $space->emergency_until->toIso8601String() : null,
            'total_seats' => (int)$space->total_seats,
            'price_per_hour' => (float)$space->price_per_hour,
            'price_regular' => (float)$space->price_per_hour,
            'price_private' => (float)$space->price_private,
            'price_room' => (float)$space->price_room,
        ]);
    }

    /**
     * Owner toggles emergency stop / re-open for their space.
     */
    public function ownerToggleEmergency(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        $space = ($user ? Space::where('user_id', $user->id)->first() : null) ?? Space::first();

        if (!$space) {
            return response()->json(['message' => 'المساحة غير موجودة'], 404);
        }

        // Toggle status
        $willClose = !$space->is_manual_disabled;
        $reason = $request->reason ?: 'إجراء طارئ مؤقت';

        if ($willClose) {
            $space->is_manual_disabled = true;
            $space->emergency_reason = $reason;
            $space->save();

            // Broadcast emergency notification to users and receptionists
            Notification::create([
                'target_role' => 'all',
                'space_id' => $space->id,
                'type' => 'emergency',
                'title' => "⚠️ تنبيه طارئ: إغلاق مؤقت لمساحة {$space->name}",
                'desc' => "نود إعلامكم بأنه تم إيقاف العمل مؤقتاً في مساحة {$space->name} بسبب ({$reason}). نعتذر عن أي إزعاج.",
                'data' => [
                    'space_id' => $space->id,
                    'reason' => $reason,
                    'status' => 'closed',
                ],
            ]);

            return response()->json([
                'message' => 'تم إغلاق المساحة طارئاً وإرسال الإشعارات بنجاح',
                'is_closed' => true,
                'emergency_reason' => $reason,
            ]);
        } else {
            $space->is_manual_disabled = false;
            $space->emergency_reason = null;
            $space->save();

            // Broadcast re-opening notification
            Notification::create([
                'target_role' => 'all',
                'space_id' => $space->id,
                'type' => 'system',
                'title' => "🟢 استئناف العمل في مساحة {$space->name}",
                'desc' => "يسعدنا إعلامكم بانتهاء حالة الطوارئ واستئناف استقبالكم كالمعتاد في مساحة {$space->name}.",
                'data' => [
                    'space_id' => $space->id,
                    'status' => 'open',
                ],
            ]);

            return response()->json([
                'message' => 'تم إلغاء الإيقاف وإعادة فتح المساحة بنجاح',
                'is_closed' => false,
                'emergency_reason' => null,
            ]);
        }
    }

    /**
     * Owner sends specific emergency reason notification (electricity, network, maintenance, fire).
     */
    public function ownerNotifyEmergency(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        $space = ($user ? Space::where('user_id', $user->id)->first() : null) ?? Space::first();

        $request->validate([
            'reason' => 'required|string',
            'hours'  => 'nullable|numeric|min:0.25|max:72',
        ]);

        $reason = $request->reason;
        $hours  = $request->hours ? (float)$request->hours : null;
        $spaceName = $space ? $space->name : 'المساحة';

        // If hours provided → close space for that duration
        if ($space && $hours) {
            $until = now()->addHours($hours);
            $space->is_manual_disabled = true;
            $space->emergency_reason   = $reason;
            $space->emergency_until    = $until;
            $space->save();
        }

        Notification::create([
            'target_role' => 'all',
            'space_id'    => $space ? $space->id : null,
            'type'        => 'emergency',
            'title'       => "تنبيه طارئ: {$reason}",
            'desc'        => $hours
                ? "تنبيه لكافة الرواد المتواجدين في {$spaceName}: حدث {$reason}. ستكون المساحة متوقفة لمدة {$hours} ساعة تقريباً. يرجى التنسيق مع موظف الاستقبال."
                : "تنبيه لكافة الرواد المتواجدين في {$spaceName}: حدث {$reason}. يرجى التنسيق مع موظف الاستقبال.",
            'data' => [
                'space_id'       => $space ? $space->id : null,
                'reason'         => $reason,
                'emergency_until'=> $hours ? now()->addHours($hours)->toIso8601String() : null,
            ],
        ]);

        return response()->json([
            'message'         => 'تم إرسال إشعار الطوارئ بنجاح',
            'is_closed'       => $space && $hours ? true : ($space ? (bool)$space->is_manual_disabled : false),
            'emergency_until' => $space && $hours ? now()->addHours($hours)->toIso8601String() : null,
        ]);
    }

    /**
     * Owner dashboard statistics & recent bookings.
     */
    public function ownerDashboardStats(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        $space = ($user ? Space::where('user_id', $user->id)->first() : null) ?? Space::first();

        if (!$space) {
            return response()->json([
                'todayBookings' => 0,
                'bookingsDelta' => 0,
                'occupied' => 0,
                'capacity' => 40,
                'revenue' => 0,
                'avgPerHour' => 0,
                'rating' => 4.8,
                'reviewsCount' => 30,
                'recentBookings' => [],
            ]);
        }

        $capacity = (int)$space->total_seats ?: 40;

        $activeBookings = Booking::with('user')
            ->where('space_id', $space->id)
            ->where('status', 'confirmed')
            ->whereNull('check_out_time')
            ->count();

        $todayBookingsCount = Booking::where('space_id', $space->id)
            ->whereDate('created_at', Carbon::today())
            ->count();

        $todayRevenue = Booking::where('space_id', $space->id)
            ->whereDate('created_at', Carbon::today())
            ->where('status', 'confirmed')
            ->sum('total_price');

        $recentBookings = Booking::with('user')
            ->where('space_id', $space->id)
            ->orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(function ($b) {
                $statusKey = 'upcoming';
                if ($b->status === 'confirmed') $statusKey = 'active';
                if ($b->status === 'completed') $statusKey = 'done';

                return [
                    'id' => $b->id,
                    'name' => $b->customer_name ?: ($b->user ? $b->user->name : 'زائر'),
                    'seat' => $b->seat_type,
                    'hours' => $b->hours,
                    'price' => (float)$b->total_price,
                    'status' => $statusKey,
                ];
            });

        $yesterdayBookingsCount = Booking::where('space_id', $space->id)
            ->whereDate('created_at', Carbon::yesterday())
            ->count();

        $bookingsDelta = $yesterdayBookingsCount > 0 
            ? round((($todayBookingsCount - $yesterdayBookingsCount) / $yesterdayBookingsCount) * 100) 
            : ($todayBookingsCount > 0 ? 100 : 0);

        $reviewsCount = $space->reviews()->count();
        $avgRating = $reviewsCount > 0 ? round($space->reviews()->avg('rating'), 1) : round($space->rating ?: 4.8, 1);

        return response()->json([
            'spaceName' => $space->name,
            'is_closed' => (bool)$space->is_manual_disabled,
            'emergency_reason' => $space->emergency_reason,
            'todayBookings' => $todayBookingsCount,
            'bookingsDelta' => $bookingsDelta,
            'occupied' => $activeBookings,
            'capacity' => $capacity,
            'revenue' => (float)$todayRevenue,
            'avgPerHour' => (float)$space->price_per_hour,
            'rating' => $avgRating,
            'reviewsCount' => $reviewsCount,
            'recentBookings' => $recentBookings,
        ]);
    }

    /**
     * Submit rating and review for a space.
     */
    public function rate(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $space = Space::findOrFail($id);
        $user = $request->user();

        \App\Models\SpaceReview::updateOrCreate(
            [
                'space_id' => $space->id,
                'user_id' => $user->id,
            ],
            [
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]
        );

        $reviewsCount = $space->reviews()->count();
        $avgRating = round($space->reviews()->avg('rating'), 1);

        return response()->json([
            'message' => 'تم استلام تقييمك بنجاح! شكراً لمشاركتنا رأيك.',
            'rating' => $avgRating,
            'reviewsCount' => $reviewsCount,
        ]);
    }

    /**
     * Owner reports and statistics.
     */
    public function ownerReports(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        $space = ($user ? Space::where('user_id', $user->id)->first() : null) ?? Space::first();

        $spaceId = $space ? $space->id : null;

        $monthRevenue = (float)\App\Models\Booking::where('space_id', $spaceId)
            ->whereIn('status', ['confirmed', 'completed'])
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_price');

        if ($monthRevenue == 0) {
            $monthRevenue = (float)\App\Models\Booking::where('space_id', $spaceId)
                ->whereIn('status', ['confirmed', 'completed'])
                ->sum('total_price');
        }

        $monthBookings = \App\Models\Booking::where('space_id', $spaceId)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        if ($monthBookings == 0) {
            $monthBookings = \App\Models\Booking::where('space_id', $spaceId)->count();
        }

        // 6 months trend
        $arabicMonths = [
            1 => 'يناير', 2 => 'فبراير', 3 => 'مارس', 4 => 'أبريل',
            5 => 'مايو', 6 => 'يونيو', 7 => 'يوليو', 8 => 'أغسطس',
            9 => 'سبتمبر', 10 => 'أكتوبر', 11 => 'نوفمبر', 12 => 'ديسمبر'
        ];

        $labels = [];
        $values = [];
        for ($i = 5; $i >= 0; $i--) {
            $d = now()->subMonths($i);
            $mNum = (int)$d->format('n');
            $yNum = (int)$d->format('Y');

            $rev = (float)\App\Models\Booking::where('space_id', $spaceId)
                ->whereIn('status', ['confirmed', 'completed'])
                ->whereMonth('created_at', $mNum)
                ->whereYear('created_at', $yNum)
                ->sum('total_price');

            $labels[] = $arabicMonths[$mNum];
            $values[] = (int)$rev;
        }

        // Weekly bookings
        $daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
        $weeklyValues = [];
        foreach ($daysOfWeek as $index => $day) {
            $cnt = \App\Models\Booking::where('space_id', $spaceId)
                ->whereRaw('DAYOFWEEK(created_at) = ?', [$index + 1])
                ->count();
            $weeklyValues[] = (int)$cnt;
        }

        // Services usage dynamically grouped from seat_type
        $seatCounts = \App\Models\Booking::where('space_id', $spaceId)
            ->selectRaw('seat_type, count(*) as total')
            ->groupBy('seat_type')
            ->pluck('total', 'seat_type');

        $totalSpaceBookings = $seatCounts->sum();
        $colorPalette = ['#009689', '#0EA5E9', '#F15B5B', '#A855F7', '#F59E0B'];
        $servicesData = [];
        $cIndex = 0;

        if ($totalSpaceBookings > 0) {
            foreach ($seatCounts as $type => $count) {
                $servicesData[] = [
                    'label' => $type ?: 'مقعد عام',
                    'value' => (int)round(($count / $totalSpaceBookings) * 100),
                    'color' => $colorPalette[$cIndex % count($colorPalette)],
                ];
                $cIndex++;
            }
        }

        return response()->json([
            'monthRevenue' => number_format($monthRevenue) . '₪',
            'monthBookings' => (string)$monthBookings,
            'revenue_chart' => [
                'labels' => $labels,
                'values' => $values,
            ],
            'weekly_bookings_chart' => [
                'labels' => $daysOfWeek,
                'values' => $weeklyValues,
            ],
            'services_usage' => $servicesData,
        ]);
    }
}
