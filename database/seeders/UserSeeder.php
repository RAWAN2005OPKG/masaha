<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::firstOrCreate(
            ['email' => 'user@masaha.ps'],
            [
                'name' => 'مستخدم تجريبي',
                'phone' => '0591234567',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'user',
            ]
        );
    }
}
