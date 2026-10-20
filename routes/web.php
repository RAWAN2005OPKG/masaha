<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/{any?}', function () {
    if (view()->exists('welcome')) {
        return view('welcome');
    }

    return response('<h1>جاري رفع الملفات...</h1><p>يرجى التأكد من رفع مجلد <code>resources/views</code> وملف <code>welcome.blade.php</code> إلى السيرفر.</p>', 200)
        ->header('Content-Type', 'text/html; charset=utf-8');
})->where('any', '.*');
