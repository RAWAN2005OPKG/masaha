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

Route::post('/register', [\App\Http\Controllers\AuthController::class, 'register']);
Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);

Route::post('/password/forgot', [\App\Http\Controllers\AuthController::class, 'forgotPassword']);
Route::post('/password/verify-code', [\App\Http\Controllers\AuthController::class, 'verifyCode']);
Route::post('/password/reset', [\App\Http\Controllers\AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/user', [\App\Http\Controllers\AuthController::class, 'updateProfile']);
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);

    // User Spaces & Favorites
    Route::get('/spaces', [\App\Http\Controllers\SpaceController::class, 'index']);
    Route::post('/spaces/{id}/favorite', [\App\Http\Controllers\SpaceController::class, 'toggleFavorite']);
    Route::get('/user/favorites', [\App\Http\Controllers\SpaceController::class, 'userFavorites']);
});

Route::get('/tasks', [\App\Http\Controllers\TaskController::class, 'index']);

// Admin Routes (You can protect this with admin middleware later)
Route::prefix('admin')->group(function () {
    Route::get('/dashboard-stats', [\App\Http\Controllers\AdminController::class, 'dashboardStats']);
    Route::get('/users', [\App\Http\Controllers\AdminController::class, 'getUsers']);

    // Space Owners Management
    Route::get('/owners', [\App\Http\Controllers\SpaceOwnerController::class, 'index']);
    Route::post('/owners', [\App\Http\Controllers\SpaceOwnerController::class, 'store']);
    Route::get('/owners/{id}', [\App\Http\Controllers\SpaceOwnerController::class, 'show']);
    Route::put('/owners/{id}', [\App\Http\Controllers\SpaceOwnerController::class, 'update']);
    Route::put('/owners/{id}/toggle-status', [\App\Http\Controllers\SpaceOwnerController::class, 'toggleStatus']);
    Route::delete('/owners/{id}', [\App\Http\Controllers\SpaceOwnerController::class, 'destroy']);
});
