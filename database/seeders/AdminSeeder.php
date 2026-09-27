<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'مدير النظام',
            'email' => 'admin@gmail.com',
            'phone' => '0599944997',
            'password' => Hash::make('admin123456'),
            'role' => 'admin',
            'status' => 'active',
        ]);
    }
}
