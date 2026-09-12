<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Space;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class SpaceSeeder extends Seeder
{
    public function run(): void
    {
        $spacesData = [
            [
                'owner_name' => 'محمد الغزاوي',
                'email' => 'm.ghazawi@spaces.ps',
                'space_name' => 'مساحة الإبداع',
                'region' => 'غزة',
                'price' => 15,
                'seats' => 20,
                'speed' => '180 Mbps'
            ],
            [
                'owner_name' => 'سلمى النجار',
                'email' => 's.najar@spaces.ps',
                'space_name' => 'مساحة المستقبل',
                'region' => 'الوسطى',
                'price' => 12,
                'seats' => 30,
                'speed' => '150 Mbps'
            ],
            [
                'owner_name' => 'كريم أبو صلاح',
                'email' => 'k.abusalah@spaces.ps',
                'space_name' => 'مساحة الريادة',
                'region' => 'غزة',
                'price' => 20,
                'seats' => 25,
                'speed' => '200 Mbps'
            ],
            [
                'owner_name' => 'أحمد يوسف',
                'email' => 'a.yousef@spaces.ps',
                'space_name' => 'مساحة التطوير',
                'region' => 'الجنوب',
                'price' => 10,
                'seats' => 40,
                'speed' => '80 Mbps'
            ],
        ];

        foreach ($spacesData as $data) {
            // Create Owner
            $owner = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['owner_name'],
                    'password' => Hash::make('password123'),
                    'role' => 'owner',
                    'phone' => '059' . rand(1000000, 9999999),
                ]
            );

            // Create Space
            Space::firstOrCreate(
                ['user_id' => $owner->id],
                [
                    'name' => $data['space_name'],
                    'region' => $data['region'],
                    'price_per_hour' => $data['price'],
                    'total_seats' => $data['seats'],
                    'internet_speed' => $data['speed'],
                    'electricity' => '24/7',
                    'sub_start_date' => Carbon::now()->subDays(rand(1, 30)),
                    'sub_duration_months' => 6,
                    'sub_end_date' => Carbon::now()->addMonths(6),
                    'sub_price' => 12000,
                    'is_manual_disabled' => false,
                ]
            );
        }
    }
}
