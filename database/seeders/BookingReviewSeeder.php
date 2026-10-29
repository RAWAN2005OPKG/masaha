<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Space;
use App\Models\User;
use App\Models\Booking;
use App\Models\SpaceReview;
use App\Models\Event;
use App\Models\Offer;
use App\Models\Notification;
use Carbon\Carbon;

class BookingReviewSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Update spaces with real seat pricing and details
        $locations = [
            1 => ['name' => 'مساحة الإبداع', 'region' => 'غزة، الرمال - شارع عمر المختار', 'price' => 15, 'price_private' => 25, 'price_room' => 45, 'seats' => 30],
            2 => ['name' => 'مساحة المستقبل', 'region' => 'الوسطى، دير البلح - شارع النخيل', 'price' => 12, 'price_private' => 20, 'price_room' => 35, 'seats' => 25],
            3 => ['name' => 'مساحة الريادة', 'region' => 'غزة، تل الهوى - مجمع الجامعات', 'price' => 20, 'price_private' => 30, 'price_room' => 60, 'seats' => 35],
            4 => ['name' => 'مساحة التطوير', 'region' => 'الجنوب، خان يونس - شارع جلال', 'price' => 10, 'price_private' => 18, 'price_room' => 30, 'seats' => 40],
            5 => ['name' => 'مساحة الأفق', 'region' => 'غزة، الميناء - شارع الرشيد', 'price' => 18, 'price_private' => 28, 'price_room' => 50, 'seats' => 28],
            6 => ['name' => 'مساحة النخبة', 'region' => 'شمال غزة، جباليا - الشارع العام', 'price' => 14, 'price_private' => 22, 'price_room' => 40, 'seats' => 32],
        ];

        foreach ($locations as $id => $data) {
            $space = Space::find($id);
            if ($space) {
                $space->update([
                    'name' => $data['name'],
                    'region' => $data['region'],
                    'price_per_hour' => $data['price'],
                    'price_private' => $data['price_private'],
                    'price_room' => $data['price_room'],
                    'total_seats' => $data['seats'],
                    'services' => 'إنترنت فائق السرعة، كهرباء 24/7، قاعات اجتماعات، مكاتب خاصة، ضيافة مجانية',
                ]);
            }
        }

        // Get or create realistic users
        $realUsers = [
            ['name' => 'أحمد العسولي', 'email' => 'ahmed@masaha.ps', 'phone' => '0599123456'],
            ['name' => 'سارة خليل', 'email' => 'sara@masaha.ps', 'phone' => '0598234567'],
            ['name' => 'محمود رضوان', 'email' => 'mahmoud@masaha.ps', 'phone' => '0597345678'],
            ['name' => 'هدى التميمي', 'email' => 'huda@masaha.ps', 'phone' => '0596456789'],
            ['name' => 'بلال المصري', 'email' => 'belal@masaha.ps', 'phone' => '0595567890'],
            ['name' => 'ريم عثمان', 'email' => 'reem@masaha.ps', 'phone' => '0594678901'],
            ['name' => 'يوسف قاسم', 'email' => 'yousef@masaha.ps', 'phone' => '0593789012'],
        ];

        $users = collect();
        foreach ($realUsers as $u) {
            $createdUser = User::firstOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['name'],
                    'phone' => $u['phone'],
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'role' => 'user',
                ]
            );
            $users->push($createdUser);
        }

        // Also ensure user@masaha.ps exists
        $testUser = User::firstOrCreate(
            ['email' => 'user@masaha.ps'],
            [
                'name' => 'مستخدم تجريبي',
                'phone' => '0591234567',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'user',
            ]
        );
        $users->push($testUser);

        $allSpaces = Space::all();
        if ($allSpaces->isEmpty()) {
            return;
        }

        // Clear previous bookings, reviews, notifications
        Booking::query()->delete();
        SpaceReview::query()->delete();

        // 3 Seat Types strictly as required
        $seatTypes = ['مقعد عادي', 'مقعد خاص', 'غرف خاصة'];

        foreach ($allSpaces as $space) {
            // Function to resolve price per seat type
            $getPrice = function ($type) use ($space) {
                if ($type === 'مقعد خاص') return (float)$space->price_private;
                if ($type === 'غرف خاصة') return (float)$space->price_room;
                return (float)$space->price_per_hour;
            };

            // 1) Seed pending bookings WITH receipt image for receptionist review
            $pendingCount = rand(1, 2);
            for ($p = 0; $p < $pendingCount; $p++) {
                $user = $users->random();
                $seat = $seatTypes[array_rand($seatTypes)];
                $price = $getPrice($seat);
                $hours = rand(2, 5);
                $total = $hours * $price;

                $booking = Booking::create([
                    'space_id' => $space->id,
                    'user_id' => $user->id,
                    'customer_name' => $user->name,
                    'customer_phone' => $user->phone,
                    'seat_type' => $seat,
                    'hours' => $hours,
                    'price_per_hour' => $price,
                    'total_price' => $total,
                    'receipt_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
                    'payment_method' => 'تحويل بنكي / بنك فلسطين',
                    'status' => 'pending',
                    'services' => $space->services,
                    'created_at' => Carbon::now()->subMinutes(rand(10, 180)),
                    'updated_at' => Carbon::now()->subMinutes(rand(10, 180)),
                ]);

                // Create notification for receptionist
                Notification::create([
                    'target_role' => 'receptionist',
                    'space_id' => $space->id,
                    'type' => 'payment',
                    'title' => 'إشعار دفع وحجز جديد',
                    'desc' => "قام {$user->name} برفع إشعار دفع لحجز {$seat} بمبلغ {$total}₪ في {$space->name}.",
                    'data' => [
                        'booking_id' => $booking->id,
                        'customer_name' => $user->name,
                        'space_name' => $space->name,
                        'amount' => $total,
                        'seat_type' => $seat,
                    ],
                ]);
            }

            // 2) Seed active / confirmed bookings for TODAY
            $todayCount = rand(3, 5);
            for ($i = 0; $i < $todayCount; $i++) {
                $hours = rand(2, 6);
                $seat = $seatTypes[array_rand($seatTypes)];
                $price = $getPrice($seat);
                $user = $users->random();
                $startH = 8 + ($i * 2);
                $checkIn = Carbon::today()->setTime($startH, 0);
                $checkOut = ($i === 0 ? Carbon::today()->setTime($startH + $hours, 0) : null);

                Booking::create([
                    'space_id' => $space->id,
                    'user_id' => $user->id,
                    'customer_name' => $user->name,
                    'customer_phone' => $user->phone,
                    'seat_type' => $seat,
                    'seat_number' => ($seat === 'غرف خاصة' ? 'R-' : 'D-') . ($i + 1),
                    'hours' => $hours,
                    'price_per_hour' => $price,
                    'total_price' => $hours * $price,
                    'receipt_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
                    'payment_method' => 'جوال باي',
                    'status' => 'confirmed',
                    'wifi_username' => 'guest_' . strtolower(substr($user->email, 0, 4)),
                    'wifi_password' => 'M@saha' . rand(100, 999),
                    'check_in_time' => $checkIn,
                    'check_out_time' => $checkOut,
                    'notes' => 'حجز نشط مؤكد',
                    'created_at' => Carbon::today()->setTime($startH - 1, rand(10, 50)),
                    'updated_at' => Carbon::today()->setTime($startH - 1, rand(10, 50)),
                ]);
            }

            // 3) Seed past bookings for history and realistic statistics
            for ($m = 1; $m <= 4; $m++) {
                $monthDate = Carbon::now()->subMonths($m);
                $count = rand(8, 14);

                for ($j = 0; $j < $count; $j++) {
                    $day = rand(1, 28);
                    $bookingDate = $monthDate->copy()->setDay($day);
                    $hours = rand(2, 6);
                    $seat = $seatTypes[array_rand($seatTypes)];
                    $price = $getPrice($seat);
                    $user = $users->random();
                    $startH = rand(8, 15);
                    $checkIn = $bookingDate->copy()->setTime($startH, 0);
                    $checkOut = $bookingDate->copy()->setTime($startH + $hours, 0);

                    Booking::create([
                        'space_id' => $space->id,
                        'user_id' => $user->id,
                        'customer_name' => $user->name,
                        'customer_phone' => $user->phone,
                        'seat_type' => $seat,
                        'seat_number' => ($seat === 'غرف خاصة' ? 'R-' : 'D-') . ($j + 1),
                        'hours' => $hours,
                        'price_per_hour' => $price,
                        'total_price' => $hours * $price,
                        'status' => 'completed',
                        'receipt_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
                        'payment_method' => 'تحويل بنكي',
                        'check_in_time' => $checkIn,
                        'check_out_time' => $checkOut,
                        'created_at' => $checkIn,
                        'updated_at' => $checkOut,
                    ]);
                }
            }

            // 4) Seed realistic reviews for space
            $reviewsData = [
                ['rating' => 5, 'comment' => 'مساحة عمل رائعة جداً، هدوء وإنترنت فائق السرعة وضيافة ممتازة.'],
                ['rating' => 5, 'comment' => 'تجربة ممتازة في الغرف الخاصة للاجتماعات، تجهيزات ممتازة وموظف استقبال راقي.'],
                ['rating' => 4, 'comment' => 'الكهرباء متوفرة 24/7 دون أي انقطاع والمكان نظيف ومريح للعمل الطويل.'],
                ['rating' => 5, 'comment' => 'أفضل مكان للعمل الحر والتركيز في المنطقة، أنصح به بشدة.'],
            ];

            foreach ($reviewsData as $rev) {
                SpaceReview::create([
                    'space_id' => $space->id,
                    'user_id' => $users->random()->id,
                    'rating' => $rev['rating'],
                    'comment' => $rev['comment'],
                    'created_at' => Carbon::now()->subDays(rand(1, 20)),
                ]);
            }
        }

        // 5) Seed realistic Events if none exist
        if (Event::count() === 0) {
            Event::create([
                'space_id' => $allSpaces->first()->id,
                'title' => 'ورشة عمل: أسرار العمل الحر عبر منصة Upwork',
                'description' => 'ورشة عملية وتفاعلية لتطوير الملف الشخصي للمستقلين وكتابة عروض عمل احترافية.',
                'date' => Carbon::now()->addDays(3)->format('Y-m-d'),
                'time' => '04:00 مساءً - 06:00 مساءً',
                'capacity' => 25,
                'joined' => 14,
                'status' => 'upcoming',
                'price' => 0,
            ]);

            Event::create([
                'space_id' => $allSpaces->count() > 1 ? $allSpaces->get(1)->id : $allSpaces->first()->id,
                'title' => 'ملتقى مطوري الويب: تقنيات React و Laravel الحديثة',
                'description' => 'جلسة نقاش وعرض لأفضل الممارسات في بناء تطبيقات الويب السريعة والآمنة.',
                'date' => Carbon::now()->addDays(7)->format('Y-m-d'),
                'time' => '03:00 مساءً - 05:30 مساءً',
                'capacity' => 30,
                'joined' => 22,
                'status' => 'upcoming',
                'price' => 0,
            ]);
        }

        // 6) Seed realistic Offers if none exist
        if (Offer::count() === 0) {
            Offer::create([
                'space_id' => $allSpaces->first()->id,
                'title' => 'خصم 20% للطلاب والمستقلين الجدد',
                'code' => 'STUDENT20',
                'discount' => 20,
                'expiry' => Carbon::now()->addMonths(2)->format('Y-m-d'),
                'used' => 18,
                'limit' => 50,
                'status' => 'active',
            ]);

            Offer::create([
                'space_id' => $allSpaces->count() > 2 ? $allSpaces->get(2)->id : $allSpaces->first()->id,
                'title' => 'خصم خاص 30% على حجز الغرف الخاصة',
                'code' => 'ROOM30',
                'discount' => 30,
                'expiry' => Carbon::now()->addMonth()->format('Y-m-d'),
                'used' => 8,
                'limit' => 25,
                'status' => 'active',
            ]);
        }
    }
}
