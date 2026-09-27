<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Space;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * User submits a booking with optional payment receipt image.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'space_id' => 'required|exists:spaces,id',
            'seat_type' => 'nullable|string',
            'hours' => 'required|integer|min:1',
            'receipt' => 'nullable|file|mimes:jpeg,png,jpg,pdf,webp|max:5120', // 5MB
        ]);

        $space = Space::findOrFail($request->space_id);

        if ($space->is_manual_disabled) {
            return response()->json([
                'message' => 'عذراً، المساحة متوقفة حالياً: ' . ($space->emergency_reason ?: 'إغلاق طارئ مؤقت')
            ], 422);
        }

        $pricePerHour = (float)$space->price_per_hour ?: 20;
        $hours = (int)$request->hours;
        $totalPrice = $hours * $pricePerHour;

        $receiptUrl = null;
        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store('receipts', 'public');
            $receiptUrl = Storage::url($path);
        }

        $booking = Booking::create([
            'user_id' => $user->id,
            'space_id' => $space->id,
            'customer_name' => $user->name,
            'customer_phone' => $user->phone,
            'seat_type' => $request->seat_type ?: 'مقعد عادي',
            'hours' => $hours,
            'price_per_hour' => $pricePerHour,
            'total_price' => $totalPrice,
            'receipt_url' => $receiptUrl,
            'payment_method' => $request->payment_method ?: 'تحويل بنكي / جوال باي',
            'status' => 'pending',
            'services' => $space->services,
        ]);

        // Send notification to Receptionists and Owner
        Notification::create([
            'target_role' => 'receptionist',
            'space_id' => $space->id,
            'type' => 'payment',
            'title' => 'إشعار دفع وحجز جديد',
            'desc' => "قام {$user->name} برفع إشعار دفع لحجز {$booking->seat_type} بمبلغ {$totalPrice}₪ في {$space->name}.",
            'data' => [
                'booking_id' => $booking->id,
                'customer_name' => $user->name,
                'space_name' => $space->name,
                'amount' => $totalPrice,
                'seat_type' => $booking->seat_type,
            ],
        ]);

        // Notification for User acknowledging receipt
        Notification::create([
            'user_id' => $user->id,
            'target_role' => 'user',
            'space_id' => $space->id,
            'type' => 'booking',
            'title' => 'تم استلام طلب حجزك',
            'desc' => "طلب حجزك في {$space->name} قيد المراجعة لدى موظف الاستقبال لتأكيد الدفع.",
            'data' => ['booking_id' => $booking->id],
        ]);

        return response()->json([
            'message' => 'تم إرسال طلب الحجز بنجاح وهو بانتظار تأكيد الاستقبال',
            'booking' => $booking,
        ], 201);
    }

    /**
     * Get bookings of the authenticated user.
     */
    public function userBookings(Request $request)
    {
        $user = $request->user();

        $bookings = Booking::with('space')
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($b) {
                // Map status to Arabic
                $arabicStatus = 'قادمة';
                if ($b->status === 'confirmed') {
                    $arabicStatus = 'حالية';
                } elseif ($b->status === 'pending') {
                    $arabicStatus = 'بانتظار التأكيد';
                } elseif ($b->status === 'completed' || $b->status === 'finished') {
                    $arabicStatus = 'منتهية';
                } elseif ($b->status === 'rejected') {
                    $arabicStatus = 'مرفوض';
                }

                return [
                    'id' => $b->id,
                    'name' => $b->space ? $b->space->name : 'مساحة العمل',
                    'space_id' => $b->space_id,
                    'date' => $b->created_at ? $b->created_at->format('Y/m/d') : '',
                    'time' => "{$b->hours} ساعات",
                    'seat' => $b->seat_type,
                    'price' => "{$b->total_price}₪",
                    'raw_status' => $b->status,
                    'status' => $arabicStatus,
                    'wifi_username' => $b->wifi_username,
                    'wifi_password' => $b->wifi_password,
                    'receipt_url' => $b->receipt_url,
                    'services' => $b->services,
                ];
            });

        return response()->json($bookings);
    }

    /**
     * Helper to get the space associated with the current receptionist / owner.
     */
    private function resolveSpaceForUser($user)
    {
        if (!$user) {
            return Space::first();
        }

        if ($user->role === 'owner') {
            return Space::where('user_id', $user->id)->first() ?? Space::first();
        }

        if ($user->role === 'receptionist') {
            if ($user->owner_id) {
                $space = Space::where('user_id', $user->owner_id)->first();
                if ($space) return $space;
            }
            return Space::first();
        }

        return Space::first();
    }

    /**
     * Get bookings for receptionist (both pending payment and processed).
     */
    public function receptionistBookings(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        $space = $this->resolveSpaceForUser($user);

        $query = Booking::with('space', 'user')->orderBy('id', 'desc');
        if ($space) {
            $query->where('space_id', $space->id);
        }

        $bookings = $query->get()->map(function ($b) {
            $statusLabel = 'حالية';
            if ($b->status === 'pending') $statusLabel = 'بانتظار المراجعة';
            if ($b->status === 'completed') $statusLabel = 'منتهية';
            if ($b->status === 'rejected') $statusLabel = 'مرفوض';

            $servicesList = [];
            if (!empty($b->services)) {
                $servicesList = array_values(array_filter(array_map('trim', preg_split('/[،,\n\r]+/', $b->services))));
            }
            if (empty($servicesList)) {
                $servicesList = ['قهوة', 'إنترنت سريع'];
            }

            return [
                'id' => (string)$b->id,
                'booking_id' => $b->id,
                'customerName' => $b->customer_name ?: ($b->user ? $b->user->name : 'زائر'),
                'customerPhone' => $b->customer_phone ?: ($b->user ? $b->user->phone : ''),
                'spaceName' => $b->space ? $b->space->name : 'المساحة',
                'seatType' => $b->seat_type,
                'seatNumber' => $b->seat_number ?: 'A-01',
                'date' => $b->created_at ? $b->created_at->format('Y/m/d') : '',
                'time' => $b->created_at ? $b->created_at->format('h:i A') : '',
                'startDate' => $b->created_at ? $b->created_at->format('Y/m/d') : '',
                'startTime' => $b->created_at ? $b->created_at->format('h:i A') : '',
                'endDate' => $b->created_at ? $b->created_at->format('Y/m/d') : '',
                'endTime' => $b->created_at ? $b->created_at->addHours($b->hours)->format('h:i A') : '',
                'durationHours' => $b->hours,
                'amount' => (float)$b->total_price,
                'paidAmount' => (float)$b->total_price,
                'receiptUrl' => $b->receipt_url ?: '',
                'status' => $b->status, // pending, confirmed, rejected, completed
                'statusLabel' => $statusLabel,
                'wifi_username' => $b->wifi_username,
                'wifi_password' => $b->wifi_password,
                'services' => $servicesList,
            ];
        });

        return response()->json($bookings);
    }

    /**
     * Receptionist confirms payment and activates Wifi for user.
     */
    public function confirmAndActivate(Request $request, $id)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $booking = Booking::with('space', 'user')->findOrFail($id);
        $booking->update([
            'status' => 'confirmed',
            'wifi_username' => $request->username,
            'wifi_password' => $request->password,
            'check_in_time' => now(),
        ]);

        $spaceName = $booking->space ? $booking->space->name : 'المساحة';

        // Notify User with their wifi credentials
        Notification::create([
            'user_id' => $booking->user_id,
            'target_role' => 'user',
            'space_id' => $booking->space_id,
            'type' => 'booking',
            'title' => 'تم تأكيد حجزك وتفعيل الإنترنت! 🎉',
            'desc' => "تم تأكيد حجزك في {$spaceName}. بيانات شبكة الإنترنت الخاصة بك: اسم المستخدم ({$request->username}) - كلمة المرور ({$request->password}).",
            'data' => [
                'booking_id' => $booking->id,
                'wifi_username' => $request->username,
                'wifi_password' => $request->password,
            ],
        ]);

        return response()->json([
            'message' => 'تم تأكيد الحجز وتفعيل بيانات الإنترنت بنجاح',
            'booking' => $booking,
        ]);
    }

    /**
     * Receptionist rejects payment notification.
     */
    public function rejectPayment(Request $request, $id)
    {
        $booking = Booking::with('space', 'user')->findOrFail($id);
        $booking->update(['status' => 'rejected']);

        $spaceName = $booking->space ? $booking->space->name : 'المساحة';

        Notification::create([
            'user_id' => $booking->user_id,
            'target_role' => 'user',
            'space_id' => $booking->space_id,
            'type' => 'system',
            'title' => 'تم رفض إشعار التحويل',
            'desc' => "عذراً، لم يتم اعتماد إشعار التحويل البنكي لحجزك في {$spaceName}. يرجى مراجعة الاستقبال.",
            'data' => ['booking_id' => $booking->id],
        ]);

        return response()->json([
            'message' => 'تم رفض الإشعار',
            'booking' => $booking,
        ]);
    }

    /**
     * Receptionist Dashboard Stats: Real Occupancy & Attendees List.
     */
    public function receptionistDashboardStats(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        $space = $this->resolveSpaceForUser($user);

        if (!$space) {
            return response()->json([
                'capacity' => 40,
                'occupied' => 0,
                'available' => 40,
                'percentage' => 0,
                'attendees' => [],
            ]);
        }

        $capacity = (int)$space->total_seats ?: 40;

        // Active attendees: confirmed bookings whose duration has not elapsed yet, or walk-ins checked in today
        $activeBookings = Booking::with('user')
            ->where('space_id', $space->id)
            ->where('status', 'confirmed')
            ->whereNull('check_out_time')
            ->orderBy('id', 'desc')
            ->get();

        $occupied = $activeBookings->count();
        $available = max(0, $capacity - $occupied);
        $percentage = $capacity > 0 ? min(100, round(($occupied / $capacity) * 100)) : 0;

        $attendees = $activeBookings->map(function ($b, $index) {
            return [
                'id' => $b->id,
                'name' => $b->customer_name ?: ($b->user ? $b->user->name : 'زائر'),
                'seat' => $b->seat_number ?: 'A-' . str_pad($index + 1, 2, '0', STR_PAD_LEFT),
                'hours' => $b->hours,
                'checkInTime' => $b->check_in_time ? Carbon::parse($b->check_in_time)->format('h:i A') : 'الآن',
            ];
        });

        return response()->json([
            'space_name' => $space->name,
            'capacity' => $capacity,
            'occupied' => $occupied,
            'available' => $available,
            'percentage' => $percentage,
            'attendees' => $attendees,
        ]);
    }

    /**
     * Receptionist checks in a walk-in visitor directly from desk.
     */
    public function checkInWalkIn(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        $space = $this->resolveSpaceForUser($user);

        $request->validate([
            'name' => 'required|string',
            'hours' => 'required|integer|min:1',
            'seat' => 'nullable|string',
        ]);

        $booking = Booking::create([
            'user_id' => $user->id, // registered under receptionist account as desk booking
            'space_id' => $space->id,
            'customer_name' => $request->name,
            'seat_type' => 'مقعد عادي',
            'seat_number' => $request->seat ?: 'D-' . rand(10, 99),
            'hours' => $request->hours,
            'price_per_hour' => (float)$space->price_per_hour,
            'total_price' => $request->hours * (float)$space->price_per_hour,
            'status' => 'confirmed',
            'check_in_time' => now(),
            'notes' => 'تسجيل وصول مباشر من الاستقبال',
        ]);

        return response()->json([
            'message' => 'تم تسجيل وصول الزائر بنجاح',
            'booking' => $booking,
        ]);
    }

    /**
     * Receptionist checks out an attendee.
     */
    public function checkOut(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        $booking->update([
            'status' => 'completed',
            'check_out_time' => now(),
        ]);

        return response()->json([
            'message' => 'تم تسجيل مغادرة الزائر بنجاح',
        ]);
    }

    /**
     * Receptionist detailed statistics.
     */
    public function receptionistStatistics(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        $space = $this->resolveSpaceForUser($user);
        $spaceId = $space ? $space->id : null;

        $todayBookings = Booking::where('space_id', $spaceId)
            ->whereDate('created_at', Carbon::today())
            ->count();

        $yesterdayBookings = Booking::where('space_id', $spaceId)
            ->whereDate('created_at', Carbon::yesterday())
            ->count();

        if ($yesterdayBookings > 0) {
            $delta = round((($todayBookings - $yesterdayBookings) / $yesterdayBookings) * 100);
            $deltaText = ($delta >= 0 ? "+{$delta}%" : "{$delta}%") . " عن أمس";
        } elseif ($todayBookings > 0) {
            $deltaText = "+100% عن أمس";
        } else {
            $deltaText = "لا توجد حجوزات اليوم بعد";
        }

        $avgHours = Booking::where('space_id', $spaceId)
            ->whereIn('status', ['confirmed', 'completed'])
            ->avg('hours');

        $avgStay = $avgHours > 0 ? round($avgHours, 1) : 0;

        $reviewsCount = $space ? $space->reviews()->count() : 0;
        if ($reviewsCount > 0) {
            $satisfaction = round(($space->reviews()->avg('rating') / 5) * 100);
        } else {
            $satisfaction = $space && $space->rating ? round(($space->rating / 5) * 100) : 100;
        }

        $daysOfWeek = [
            ['id' => 'sun', 'label' => 'الأحد', 'day' => 1],
            ['id' => 'mon', 'label' => 'الاثنين', 'day' => 2],
            ['id' => 'tue', 'label' => 'الثلاثاء', 'day' => 3],
            ['id' => 'wed', 'label' => 'الأربعاء', 'day' => 4],
            ['id' => 'thu', 'label' => 'الخميس', 'day' => 5],
        ];

        $weeklyAttendance = [];
        foreach ($daysOfWeek as $d) {
            $cnt = Booking::where('space_id', $spaceId)
                ->whereRaw('DAYOFWEEK(created_at) = ?', [$d['day']])
                ->count();
            $weeklyAttendance[] = [
                'id' => $d['id'],
                'label' => $d['label'],
                'value' => (int)$cnt,
            ];
        }

        $r1 = Booking::where('space_id', $spaceId)->whereRaw('HOUR(created_at) >= 8 AND HOUR(created_at) < 10')->count();
        $r2 = Booking::where('space_id', $spaceId)->whereRaw('HOUR(created_at) >= 10 AND HOUR(created_at) < 12')->count();
        $r3 = Booking::where('space_id', $spaceId)->whereRaw('HOUR(created_at) >= 12 AND HOUR(created_at) < 16')->count();
        $r4 = Booking::where('space_id', $spaceId)->whereRaw('HOUR(created_at) >= 16 AND HOUR(created_at) < 18')->count();
        $r5 = Booking::where('space_id', $spaceId)->whereRaw('HOUR(created_at) >= 18 AND HOUR(created_at) <= 22')->count();

        $max = max(1, $r1, $r2, $r3, $r4, $r5);
        $peakHours = [
            ['id' => 'p1', 'range' => '8ص - 10ص', 'percent' => round(($r1 / $max) * 100), 'color' => '#3B82F6'],
            ['id' => 'p2', 'range' => '10ص - 12م', 'percent' => round(($r2 / $max) * 100), 'color' => '#14B8A6'],
            ['id' => 'p3', 'range' => '12م - 4م', 'percent' => round(($r3 / $max) * 100), 'color' => '#EF4444'],
            ['id' => 'p4', 'range' => '4م - 6م', 'percent' => round(($r4 / $max) * 100), 'color' => '#F59E0B'],
            ['id' => 'p5', 'range' => '6م - 8م', 'percent' => round(($r5 / $max) * 100), 'color' => '#A855F7'],
        ];

        return response()->json([
            'today_bookings' => (string)$todayBookings,
            'delta_text' => $deltaText,
            'satisfaction' => "{$satisfaction}%",
            'avg_stay' => "{$avgStay} ساعة",
            'weekly_attendance' => $weeklyAttendance,
            'peak_hours' => $peakHours,
        ]);
    }
}
