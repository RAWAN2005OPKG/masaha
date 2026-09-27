<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('throttle:3,1')->post('/register', [\App\Http\Controllers\AuthController::class, 'register']);
Route::middleware('throttle:5,1')->post('/login', [\App\Http\Controllers\AuthController::class, 'login']);

Route::middleware('throttle:3,1')->post('/password/forgot', [\App\Http\Controllers\AuthController::class, 'forgotPassword']);
Route::middleware('throttle:5,1')->post('/password/verify-code', [\App\Http\Controllers\AuthController::class, 'verifyCode']);
Route::middleware('throttle:5,1')->post('/password/reset', [\App\Http\Controllers\AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $userBookings = \App\Models\Booking::where('user_id', $user->id)
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->get();

        // 50 base points + 10 points per hour (+25 bonus if confirmed/completed)
        $points = 0;
        foreach ($userBookings as $b) {
            $h = max(1, (int)$b->hours);
            $points += 50 + ($h * 10);
            if (in_array($b->status, ['confirmed', 'completed'])) {
                $points += 25;
            }
        }

        $level = 'المستوى البرونزي';
        $nextLevel = 'المستوى الفضي';
        $target = 100;

        if ($points >= 500) {
            $level = 'المستوى الماسي';
            $nextLevel = 'القمة';
            $target = 1000;
        } elseif ($points >= 300) {
            $level = 'المستوى الذهبي';
            $nextLevel = 'المستوى الماسي 💎';
            $target = 500;
        } elseif ($points >= 100) {
            $level = 'المستوى الفضي';
            $nextLevel = 'المستوى الذهبي 🥇';
            $target = 300;
        }

        $needed = max(0, $target - $points);
        $progress = $points > 0 ? min(100, round(($points / $target) * 100)) : 0;

        $userData = $user->toArray();
        $userData['points'] = $points;
        $userData['level'] = $level;
        $userData['next_level'] = $nextLevel;
        $userData['points_needed'] = $needed;
        $userData['progress_percent'] = $progress;

        return response()->json($userData);
    });
    Route::put('/user', [\App\Http\Controllers\AuthController::class, 'updateProfile']);
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);

    // User Spaces & Favorites & Ratings
    Route::post('/spaces/{id}/favorite', [\App\Http\Controllers\SpaceController::class, 'toggleFavorite']);
    Route::get('/user/favorites', [\App\Http\Controllers\SpaceController::class, 'userFavorites']);
    Route::post('/spaces/{id}/rate', [\App\Http\Controllers\SpaceController::class, 'rate']);

    // User Bookings
    Route::post('/bookings', [\App\Http\Controllers\BookingController::class, 'store']);
    Route::get('/user/bookings', [\App\Http\Controllers\BookingController::class, 'userBookings']);
});

// Notifications (Accessible with Sanctum token or fallback for public)
Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
});
Route::middleware(['auth:sanctum', 'role:admin,owner'])->post('/notifications/send', [\App\Http\Controllers\NotificationController::class, 'send']);

// Events Participation
Route::middleware('auth:sanctum')->post('/events/{id}/join', [\App\Http\Controllers\EventOfferController::class, 'joinEvent']);

// Receptionist Endpoints (Restricted to Receptionist and Admin)
Route::middleware(['auth:sanctum', 'role:receptionist,admin'])->prefix('receptionist')->group(function () {
    Route::get('/bookings', [\App\Http\Controllers\BookingController::class, 'receptionistBookings']);
    Route::post('/bookings/{id}/confirm', [\App\Http\Controllers\BookingController::class, 'confirmAndActivate']);
    Route::post('/bookings/{id}/reject', [\App\Http\Controllers\BookingController::class, 'rejectPayment']);
    Route::get('/dashboard-stats', [\App\Http\Controllers\BookingController::class, 'receptionistDashboardStats']);
    Route::get('/statistics', [\App\Http\Controllers\BookingController::class, 'receptionistStatistics']);
    Route::post('/check-in', [\App\Http\Controllers\BookingController::class, 'checkInWalkIn']);
    Route::post('/check-out/{id}', [\App\Http\Controllers\BookingController::class, 'checkOut']);
});

// Owner Endpoints (Restricted to Owner and Admin)
Route::middleware(['auth:sanctum', 'role:owner,admin'])->prefix('owner')->group(function () {
    Route::get('/space', [\App\Http\Controllers\SpaceController::class, 'ownerSpace']);
    Route::post('/space/emergency-toggle', [\App\Http\Controllers\SpaceController::class, 'ownerToggleEmergency']);
    Route::post('/space/notify-emergency', [\App\Http\Controllers\SpaceController::class, 'ownerNotifyEmergency']);
    Route::get('/dashboard-stats', [\App\Http\Controllers\SpaceController::class, 'ownerDashboardStats']);
    Route::get('/reports', [\App\Http\Controllers\SpaceController::class, 'ownerReports']);
    Route::get('/events', [\App\Http\Controllers\EventOfferController::class, 'ownerEvents']);
    Route::post('/events', [\App\Http\Controllers\EventOfferController::class, 'storeOwnerEvent']);
    Route::put('/events/{id}', [\App\Http\Controllers\EventOfferController::class, 'updateOwnerEvent']);
    Route::delete('/events/{id}', [\App\Http\Controllers\EventOfferController::class, 'deleteOwnerEvent']);
    Route::get('/offers', [\App\Http\Controllers\EventOfferController::class, 'ownerOffers']);
    Route::post('/offers', [\App\Http\Controllers\EventOfferController::class, 'storeOwnerOffer']);
    Route::delete('/offers/{id}', [\App\Http\Controllers\EventOfferController::class, 'deleteOwnerOffer']);
    Route::get('/staff', [\App\Http\Controllers\OwnerStaffController::class, 'index']);
    Route::post('/staff', [\App\Http\Controllers\OwnerStaffController::class, 'store']);
    Route::put('/staff/{id}', [\App\Http\Controllers\OwnerStaffController::class, 'update']);
    Route::delete('/staff/{id}', [\App\Http\Controllers\OwnerStaffController::class, 'destroy']);
});

// Public / Exploration Routes
Route::get('/spaces', [\App\Http\Controllers\SpaceController::class, 'index']);
Route::get('/spaces/{id}', [\App\Http\Controllers\SpaceController::class, 'show']);
Route::get('/events', [\App\Http\Controllers\EventOfferController::class, 'getEvents']);
Route::get('/offers', [\App\Http\Controllers\EventOfferController::class, 'getOffers']);

Route::get('/tasks', [\App\Http\Controllers\TaskController::class, 'index']);

// Admin Routes (Restricted to Admin Only)
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard-stats', [\App\Http\Controllers\AdminController::class, 'dashboardStats']);
    Route::get('/reports', [\App\Http\Controllers\AdminController::class, 'reports']);
    Route::get('/users', [\App\Http\Controllers\AdminController::class, 'getUsers']);

    // Space Owners Management
    Route::get('/owners', [\App\Http\Controllers\SpaceOwnerController::class, 'index']);
    Route::post('/owners', [\App\Http\Controllers\SpaceOwnerController::class, 'store']);
    Route::get('/owners/{id}', [\App\Http\Controllers\SpaceOwnerController::class, 'show']);
    Route::put('/owners/{id}', [\App\Http\Controllers\SpaceOwnerController::class, 'update']);
    Route::put('/owners/{id}/toggle-status', [\App\Http\Controllers\SpaceOwnerController::class, 'toggleStatus']);
    Route::delete('/owners/{id}', [\App\Http\Controllers\SpaceOwnerController::class, 'destroy']);

    // Spaces Management
    Route::get('/spaces', [\App\Http\Controllers\SpaceController::class, 'adminIndex']);
    Route::get('/spaces/{id}', [\App\Http\Controllers\SpaceController::class, 'adminShow']);
    Route::put('/spaces/{id}', [\App\Http\Controllers\SpaceController::class, 'adminUpdate']);
    Route::put('/spaces/{id}/toggle-status', [\App\Http\Controllers\SpaceController::class, 'adminToggleStatus']);
    Route::delete('/spaces/{id}', [\App\Http\Controllers\SpaceController::class, 'adminDestroy']);
});
