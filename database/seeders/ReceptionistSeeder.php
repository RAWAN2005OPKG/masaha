<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReceptionistSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::firstOrCreate(
            ['email' => 'receptionist@masaha.ps'],
            [
                'name' => 'سكرتير النظام',
                'phone' => '0590000123',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'receptionist',
            ]
        );
    }
}
