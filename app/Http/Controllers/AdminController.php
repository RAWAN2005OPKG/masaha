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

        return response()->json([
            'total_users' => $totalUsers,
            'users_growth' => round($growth, 1)
        ]);
    }

    public function getUsers()
    {
        $users = User::select('id', 'name', 'email', 'status', 'created_at', 'role', 'avatar', 'rating')
            ->where('role', 'user') // Only fetch normal users, exclude admins and owners
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                // Check if avatar is full URL, otherwise assume storage
                $avatarUrl = $user->avatar 
                    ? (filter_var($user->avatar, FILTER_VALIDATE_URL) ? $user->avatar : asset('storage/' . $user->avatar)) 
                    : null;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                    'role' => $user->role,
                    'avatar' => $avatarUrl,
                    'joinDate' => $user->created_at ? $user->created_at->format('Y-m-d') : 'غير معروف',
                    'rating' => $user->rating ? (float)$user->rating : null, // Dynamic rating
                ];
            });

        return response()->json($users);
    }
}
