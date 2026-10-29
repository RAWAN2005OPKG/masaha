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
                'region' => 'غزة، الرمال - شارع عمر المختار',
                'price' => 15,
                'price_private' => 25,
                'price_room' => 45,
                'seats' => 30,
                'speed' => '180 Mbps',
                'services' => 'إنترنت ألياف ضوئية فائق السرعة، كهرباء دائمة 24/7، مكاتب خاصة، قاعات اجتماعات، مشروبات وضيافة مجانية، طابعات وشاشات عرض'
            ],
            [
                'owner_name' => 'سلمى النجار',
                'email' => 's.najar@spaces.ps',
                'space_name' => 'مساحة المستقبل',
                'region' => 'الوسطى، دير البلح - شارع النخيل',
                'price' => 12,
                'price_private' => 20,
                'price_room' => 35,
                'seats' => 25,
                'speed' => '150 Mbps',
                'services' => 'إنترنت مستقر، طاقة شمسية ومولدات، غرف هادئة للمكالمات، كافتيريا متكاملة، مواقف سيارات'
            ],
            [
                'owner_name' => 'كريم أبو صلاح',
                'email' => 'k.abusalah@spaces.ps',
                'space_name' => 'مساحة الريادة',
                'region' => 'غزة، تل الهوى - مجمع الجامعات',
                'price' => 20,
                'price_private' => 30,
                'price_room' => 60,
                'seats' => 35,
                'speed' => '200 Mbps',
                'services' => 'مساحات عمل مرنة، مكاتب خاصة تنفيذية، قاعة مؤتمرات وورش عمل، شاشات ذكية، تكييف مركزي'
            ],
            [
                'owner_name' => 'أحمد يوسف',
                'email' => 'a.yousef@spaces.ps',
                'space_name' => 'مساحة التطوير',
                'region' => 'الجنوب، خان يونس - شارع جلال',
                'price' => 10,
                'price_private' => 18,
                'price_room' => 30,
                'seats' => 40,
                'speed' => '100 Mbps',
                'services' => 'بيئة هادئة ومحفزة، إنترنت عالي السرعة، قاعات تدريب، طابعات ليزر، ضيافة مجانية'
            ],
            [
                'owner_name' => 'طارق الزهار',
                'email' => 't.zahar@spaces.ps',
                'space_name' => 'مساحة الأفق',
                'region' => 'غزة، الميناء - شارع الرشيد',
                'price' => 18,
                'price_private' => 28,
                'price_room' => 50,
                'seats' => 28,
                'speed' => '220 Mbps',
                'services' => 'إطلالة بحرية هادئة، إنترنت عالي الجودة، مكاتب مخصصة للمستقلين، قاعات اجتماعات مجهزة'
            ],
            [
                'owner_name' => 'محمود المصري',
                'email' => 'm.masri@spaces.ps',
                'space_name' => 'مساحة النخبة',
                'region' => 'شمال غزة، جباليا - الشارع العام',
                'price' => 14,
                'price_private' => 22,
                'price_room' => 40,
                'seats' => 32,
                'speed' => '160 Mbps',
                'services' => 'مكاتب مريحة ومريحة للعمل، شبكة إنترنت احتياطية، كهرباء متواصلة، غرف اجتماعات خاصة'
            ],
        ];

        foreach ($spacesData as $data) {
            // Create or update Owner
            $owner = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['owner_name'],
                    'password' => Hash::make('password123'),
                    'role' => 'owner',
                    'phone' => '059' . rand(1000000, 9999999),
                ]
            );

            // Create or update Space
            $space = Space::where('user_id', $owner->id)->first();
            if ($space) {
                $space->update([
                    'name' => $data['space_name'],
                    'region' => $data['region'],
                    'price_per_hour' => $data['price'],
                    'price_private' => $data['price_private'],
                    'price_room' => $data['price_room'],
                    'total_seats' => $data['seats'],
                    'internet_speed' => $data['speed'],
                    'electricity' => '24/7',
                    'services' => $data['services'],
                    'is_manual_disabled' => false,
                ]);
            } else {
                Space::create([
                    'user_id' => $owner->id,
                    'name' => $data['space_name'],
                    'region' => $data['region'],
                    'price_per_hour' => $data['price'],
                    'price_private' => $data['price_private'],
                    'price_room' => $data['price_room'],
                    'total_seats' => $data['seats'],
                    'internet_speed' => $data['speed'],
                    'electricity' => '24/7',
                    'services' => $data['services'],
                    'sub_start_date' => Carbon::now()->subDays(rand(1, 30)),
                    'sub_duration_months' => 6,
                    'sub_end_date' => Carbon::now()->addMonths(6),
                    'sub_price' => 12000,
                    'is_manual_disabled' => false,
                ]);
            }
        }
    }
}
