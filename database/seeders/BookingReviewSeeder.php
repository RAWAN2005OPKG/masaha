<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Space;
use App\Models\User;
use App\Models\Booking;
use App\Models\SpaceReview;
use Carbon\Carbon;

class BookingReviewSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Update spaces with precise, realistic locations and details
        $locations = [
            1 => ['name' => 'مساحة الإبداع', 'region' => 'غزة، الرمال - شارع عمر المختار', 'price' => 15, 'seats' => 30],
            2 => ['name' => 'مساحة المستقبل', 'region' => 'الوسطى، دير البلح - شارع النخيل', 'price' => 12, 'seats' => 25],
            3 => ['name' => 'مساحة الريادة', 'region' => 'غزة، تل الهوى - مجمع الجامعات', 'price' => 20, 'seats' => 35],
            4 => ['name' => 'مساحة التطوير', 'region' => 'الجنوب، خان يونس - شارع جلال', 'price' => 10, 'seats' => 40],
            5 => ['name' => 'مساحة الأفق', 'region' => 'غزة، الميناء - شارع الرشيد', 'price' => 18, 'seats' => 28],
            6 => ['name' => 'مساحة النخبة', 'region' => 'شمال غزة، جباليا - الشارع العام', 'price' => 14, 'seats' => 32],
        ];

        foreach ($locations as $id => $data) {
            $space = Space::find($id);
            if ($space) {
                $space->update([
                    'name' => $data['name'],
                    'region' => $data['region'],
                    'price_per_hour' => $data['price'],
                    'total_seats' => $data['seats'],
                    'services' => 'إنترنت فائق السرعة، كهرباء 24/7، قاعات اجتماعات، مكاتب خاصة، ضيافة مجانية',
                ]);
            }
        }

        // Get normal users to attribute bookings
        $users = User::where('role', 'user')->get();
        if ($users->isEmpty()) {
            $user = User::firstOrCreate(
                ['email' => 'user@masaha.ps'],
                [
                    'name' => 'مستخدم تجريبي',
                    'phone' => '0591234567',
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'role' => 'user',
                ]
            );
            $users = collect([$user]);
        }

        $allSpaces = Space::all();
        if ($allSpaces->isEmpty()) {
            return;
        }

        // 2. Clear old test bookings and seed fresh dynamic data
        Booking::query()->delete();
        SpaceReview::query()->delete();

        $seatTypes = ['مكتب مشترك', 'مكتب فردي', 'قاعة اجتماعات', 'مساحة هادئة'];
        $customerNames = ['أحمد العسولي', 'سارة خليل', 'محمود رضوان', 'هدى التميمي', 'بلال المصري', 'ريم عثمان', 'يوسف قاسم'];

        foreach ($allSpaces as $space) {
            $pricePerHour = (float)$space->price_per_hour ?: 15;

            // Seed bookings for TODAY (3 to 5 bookings per space)
            $todayCount = rand(3, 5);
            for ($i = 0; $i < $todayCount; $i++) {
                $hours = rand(2, 6);
                $seat = $seatTypes[array_rand($seatTypes)];
                $user = $users->random();
                $custName = $customerNames[array_rand($customerNames)];
                $startH = 8 + ($i * 2);
                $checkIn = Carbon::today()->setTime($startH, 0);
                $checkOut = ($i === 0 ? Carbon::today()->setTime($startH + $hours, 0) : null); // some active

                Booking::create([
                    'space_id' => $space->id,
                    'user_id' => $user->id,
                    'customer_name' => $custName,
                    'customer_phone' => '059' . rand(1000000, 9999999),
                    'seat_type' => $seat,
                    'seat_number' => 'A' . ($i + 1),
                    'hours' => $hours,
                    'price_per_hour' => $pricePerHour,
                    'total_price' => $hours * $pricePerHour,
                    'status' => 'confirmed',
                    'check_in_time' => $checkIn,
                    'check_out_time' => $checkOut,
                    'notes' => 'حجز نشط في الاستقبال',
                    'created_at' => Carbon::today()->setTime($startH - 1, rand(10, 50)),
                    'updated_at' => Carbon::today()->setTime($startH - 1, rand(10, 50)),
                ]);
            }

            // Seed bookings for YESTERDAY (2 to 4 bookings per space)
            $yesterdayCount = rand(2, 4);
            for ($i = 0; $i < $yesterdayCount; $i++) {
                $hours = rand(2, 5);
                $seat = $seatTypes[array_rand($seatTypes)];
                $user = $users->random();
                $custName = $customerNames[array_rand($customerNames)];
                $startH = 9 + $i;
                $checkIn = Carbon::yesterday()->setTime($startH, 0);
                $checkOut = Carbon::yesterday()->setTime($startH + $hours, 0);

                Booking::create([
                    'space_id' => $space->id,
                    'user_id' => $user->id,
                    'customer_name' => $custName,
                    'customer_phone' => '059' . rand(1000000, 9999999),
                    'seat_type' => $seat,
                    'seat_number' => 'B' . ($i + 1),
                    'hours' => $hours,
                    'price_per_hour' => $pricePerHour,
                    'total_price' => $hours * $pricePerHour,
                    'status' => 'completed',
                    'check_in_time' => $checkIn,
                    'check_out_time' => $checkOut,
                    'created_at' => Carbon::yesterday()->setTime($startH - 1, rand(10, 50)),
                    'updated_at' => $checkOut,
                ]);
            }

            // Seed historical bookings for past 6 months to populate charts
            for ($m = 1; $m <= 5; $m++) {
                $monthDate = Carbon::now()->subMonths($m);
                $bookingsInMonth = rand(10, 16);

                for ($j = 0; $j < $bookingsInMonth; $j++) {
                    $day = rand(1, 28);
                    $bookingDate = $monthDate->copy()->setDay($day);
                    $hours = rand(2, 7);
                    $seat = $seatTypes[array_rand($seatTypes)];
                    $user = $users->random();
                    $custName = $customerNames[array_rand($customerNames)];
                    $startH = rand(8, 16);
                    $checkIn = $bookingDate->copy()->setTime($startH, 0);
                    $checkOut = $bookingDate->copy()->setTime($startH + $hours, 0);

                    Booking::create([
                        'space_id' => $space->id,
                        'user_id' => $user->id,
                        'customer_name' => $custName,
                        'customer_phone' => '059' . rand(1000000, 9999999),
                        'seat_type' => $seat,
                        'seat_number' => 'C' . ($j + 1),
                        'hours' => $hours,
                        'price_per_hour' => $pricePerHour,
                        'total_price' => $hours * $pricePerHour,
                        'status' => 'completed',
                        'check_in_time' => $checkIn,
                        'check_out_time' => $checkOut,
                        'created_at' => $checkIn,
                        'updated_at' => $checkOut,
                    ]);
                }
            }

            // 3. Seed Reviews in space_reviews for genuine rating and satisfaction calculation
            $reviewsData = [
                ['rating' => 5, 'comment' => 'مساحة ممتازة جداً وهادئة ومناسبة للعمل والتركيز.'],
                ['rating' => 5, 'comment' => 'سرعة الإنترنت رائعة والخدمات ممتازة وموظف الاستقبال متعاون جداً.'],
                ['rating' => 4, 'comment' => 'بيئة عمل مريحة والتكييف والكهرباء متوفرة باستمرار.'],
                ['rating' => 5, 'comment' => 'أفضل مساحة عمل في المنطقة، أنصح بها بشدة.'],
            ];

            foreach ($reviewsData as $rev) {
                SpaceReview::create([
                    'space_id' => $space->id,
                    'user_id' => $users->random()->id,
                    'rating' => $rev['rating'],
                    'comment' => $rev['comment'],
                    'created_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);
            }
        }
    }
}
