<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Space;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class SpaceOwnerController extends Controller
{
    public function index()
    {
        $owners = User::where('role', 'owner')->with('spaces')->get();
        $today = Carbon::today();
        
        $data = $owners->map(function ($owner) use ($today) {
            $space = $owner->spaces->first(); // Assuming one space per owner based on UI
            
            $startDate = $space && $space->sub_start_date ? Carbon::parse($space->sub_start_date)->startOfDay() : null;
            $endDate = $space && $space->sub_end_date ? Carbon::parse($space->sub_end_date)->startOfDay() : null;

            $status = 'نشط';
            $remainingDays = 0;
            $isPending = false;
            $isExpired = false;

            if ($startDate && $today->lt($startDate)) {
                $status = 'قريباً (قيد المراجعة)';
                $isPending = true;
                $remainingDays = $today->diffInDays($startDate);
            } elseif ($endDate && $today->gt($endDate)) {
                $status = 'منتهي الاشتراك';
                $isExpired = true;
            } elseif ($space && $space->is_manual_disabled) {
                $status = 'معطل';
            } else {
                $status = 'نشط';
                if ($endDate) {
                    $remainingDays = $today->diffInDays($endDate);
                }
            }

            return [
                'id' => $owner->id,
                'name' => $owner->name,
                'email' => $owner->email,
                'phone' => $owner->phone,
                'birthDate' => $owner->birth_date ? Carbon::parse($owner->birth_date)->format('Y-m-d') : null,
                'initial' => mb_substr($owner->name, 0, 1),
                'avatarColor' => 'bg-violet-600',
                'price' => $space ? $space->sub_price : 0,
                'spaces' => $owner->spaces->count(),
                'spaceName' => $space ? $space->name : '',
                'startDate' => $startDate ? $startDate->format('Y-m-d') : null,
                'endDate' => $endDate ? $endDate->format('Y-m-d') : null,
                'duration' => $space ? ($space->sub_duration_value ?: $space->sub_duration_months ?: 1) : 1,
                'durationUnit' => $space ? ($space->sub_duration_unit ?: 'months') : 'months',
                'isManualDisabled' => $space ? $space->is_manual_disabled : false,
                'isPending' => $isPending,
                'isExpired' => $isExpired,
                'status' => $status,
                'remainingDays' => $remainingDays,
            ];
        });

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|min:2',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'spaceName' => 'required|string|min:2',
            'phone' => 'required|string|unique:users,phone',
            'region' => 'required|string',
            'birthDate' => 'required|date',
            'seats' => 'required|numeric|min:1',
            'pricePerHour' => 'required|numeric|min:0.01',
            'pricePrivate' => 'required|numeric|min:0.01',
            'priceRoom' => 'required|numeric|min:0.01',
            'internet' => 'nullable|string',
            'electricity' => 'nullable|string',
            'services' => 'nullable|string',
            'startDate' => 'required|date',
            'duration' => 'required|numeric|min:1',
            'durationUnit' => 'nullable|string|in:days,months,years',
        ], [
            'name.required' => 'حقل الاسم إجباري',
            'email.required' => 'حقل البريد الإلكتروني إجباري',
            'password.required' => 'حقل كلمة المرور إجباري',
            'spaceName.required' => 'حقل اسم المساحة إجباري',
            'phone.required' => 'حقل رقم الهاتف إجباري',
            'region.required' => 'حقل المكان / المنطقة إجباري',
            'birthDate.required' => 'حقل تاريخ الميلاد إجباري',
            'seats.required' => 'حقل إجمالي المقاعد إجباري',
            'pricePerHour.required' => 'حقل سعر الموقع العادي إجباري',
            'pricePrivate.required' => 'حقل سعر الموقع الخاص إجباري',
            'priceRoom.required' => 'حقل سعر الغرف الخاصة إجباري',
            'startDate.required' => 'تاريخ بداية الاشتراك إجباري',
            'duration.required' => 'مدة الاشتراك إجبارية',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'birth_date' => $request->birthDate,
            'role' => 'owner',
            'status' => 'active',
        ]);

        $startDate = Carbon::parse($request->startDate)->startOfDay();
        $duration = (int)$request->duration;
        $unit = $request->durationUnit ?: 'months';

        if ($unit === 'days') {
            $endDate = $startDate->copy()->addDays($duration);
            $monthsVal = round($duration / 30, 1);
        } elseif ($unit === 'years') {
            $endDate = $startDate->copy()->addYears($duration);
            $monthsVal = $duration * 12;
        } else {
            $endDate = $startDate->copy()->addMonths($duration);
            $monthsVal = $duration;
        }

        Space::create([
            'user_id' => $user->id,
            'name' => $request->spaceName,
            'phone' => $request->phone,
            'region' => $request->region,
            'internet_speed' => $request->internet ?: '100 Mbps',
            'total_seats' => $request->seats,
            'electricity' => $request->electricity ?: '24/7',
            'price_per_hour' => (float)$request->pricePerHour,
            'price_private' => (float)$request->pricePrivate,
            'price_room' => (float)$request->priceRoom,
            'services' => $request->services,
            'sub_start_date' => $startDate,
            'sub_duration_months' => $monthsVal,
            'sub_duration_unit' => $unit,
            'sub_duration_value' => $duration,
            'sub_end_date' => $endDate,
            'sub_price' => 0,
            'is_manual_disabled' => false,
        ]);

        return response()->json([
            'message' => 'تم إنشاء حساب صاحب المساحة والمساحة بنجاح',
            'endDate' => $endDate->format('Y-m-d'),
        ], 201);
    }

    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        if ($user->role !== 'owner') return response()->json(['error' => 'Unauthorized'], 403);
        
        $space = $user->spaces()->first();
        if ($space) {
            $space->is_manual_disabled = !$space->is_manual_disabled;
            $space->save();
        }
        
        return response()->json([
            'message' => 'تم تحديث حالة الحساب بنجاح',
            'is_manual_disabled' => $space ? $space->is_manual_disabled : false
        ]);
    }

    public function show($id)
    {
        $owner = User::with('spaces')->findOrFail($id);
        if ($owner->role !== 'owner') return response()->json(['error' => 'Unauthorized'], 403);

        $space = $owner->spaces->first();

        return response()->json([
            'id' => $owner->id,
            'name' => $owner->name,
            'email' => $owner->email,
            'phone' => $owner->phone,
            'birthDate' => $owner->birth_date ? Carbon::parse($owner->birth_date)->format('Y-m-d') : '',
            'spaceName' => $space ? $space->name : '',
            'pricePerHour' => $space ? $space->price_per_hour : '',
            'pricePrivate' => $space ? $space->price_private : '',
            'priceRoom' => $space ? $space->price_room : '',
            'region' => $space ? $space->region : 'غزة',
            'internet' => $space ? $space->internet_speed : '',
            'seats' => $space ? $space->total_seats : '',
            'electricity' => $space ? $space->electricity : '',
            'services' => $space ? $space->services : '',
            'duration' => $space ? ($space->sub_duration_value ?: $space->sub_duration_months ?: 3) : 3,
            'durationUnit' => $space ? ($space->sub_duration_unit ?: 'months') : 'months',
            'startDate' => $space && $space->sub_start_date ? $space->sub_start_date->format('Y-m-d') : '',
            'endDate' => $space && $space->sub_end_date ? $space->sub_end_date->format('Y-m-d') : '',
        ]);
    }

    public function update(Request $request, $id)
    {
        $owner = User::findOrFail($id);
        if ($owner->role !== 'owner') return response()->json(['error' => 'Unauthorized'], 403);

        $request->validate([
            'name' => 'required|string|min:2',
            'email' => 'required|email|unique:users,email,'.$id,
            'phone' => 'required|string|unique:users,phone,'.$id,
            'birthDate' => 'required|date',
            'spaceName' => 'required|string|min:2',
            'region' => 'required|string',
            'seats' => 'required|numeric|min:1',
            'pricePerHour' => 'required|numeric|min:0.01',
            'pricePrivate' => 'required|numeric|min:0.01',
            'priceRoom' => 'required|numeric|min:0.01',
            'startDate' => 'required|date',
            'duration' => 'required|numeric|min:1',
            'durationUnit' => 'nullable|string|in:days,months,years',
        ], [
            'name.required' => 'حقل الاسم إجباري',
            'email.required' => 'حقل البريد الإلكتروني إجباري',
            'phone.required' => 'حقل رقم الهاتف إجباري',
            'birthDate.required' => 'حقل تاريخ الميلاد إجباري',
            'spaceName.required' => 'حقل اسم المساحة إجباري',
            'region.required' => 'حقل المكان / المنطقة إجباري',
            'seats.required' => 'حقل إجمالي المقاعد إجباري',
            'pricePerHour.required' => 'حقل سعر الموقع العادي إجباري',
            'pricePrivate.required' => 'حقل سعر الموقع الخاص إجباري',
            'priceRoom.required' => 'حقل سعر الغرف الخاصة إجباري',
            'startDate.required' => 'تاريخ بداية الاشتراك إجباري',
            'duration.required' => 'مدة الاشتراك إجبارية',
        ]);

        $owner->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'birth_date' => $request->birthDate,
        ]);

        if ($request->filled('password')) {
            $owner->update(['password' => Hash::make($request->password)]);
        }

        $space = $owner->spaces()->first();
        if ($space) {
            $startDate = Carbon::parse($request->startDate)->startOfDay();
            $duration = (int)$request->duration;
            $unit = $request->durationUnit ?: 'months';

            if ($unit === 'days') {
                $endDate = $startDate->copy()->addDays($duration);
                $monthsVal = round($duration / 30, 1);
            } elseif ($unit === 'years') {
                $endDate = $startDate->copy()->addYears($duration);
                $monthsVal = $duration * 12;
            } else {
                $endDate = $startDate->copy()->addMonths($duration);
                $monthsVal = $duration;
            }

            $space->update([
                'name' => $request->spaceName,
                'region' => $request->region,
                'price_per_hour' => (float)$request->pricePerHour,
                'price_private' => (float)$request->pricePrivate,
                'price_room' => (float)$request->priceRoom,
                'total_seats' => $request->seats,
                'internet_speed' => $request->internet ?: $space->internet_speed,
                'electricity' => $request->electricity ?: $space->electricity,
                'services' => $request->services,
                'sub_start_date' => $startDate,
                'sub_duration_months' => $monthsVal,
                'sub_duration_unit' => $unit,
                'sub_duration_value' => $duration,
                'sub_end_date' => $endDate,
            ]);
        }

        return response()->json([
            'message' => 'تم تحديث بيانات صاحب المساحة والاشتراك بنجاح',
            'endDate' => isset($endDate) ? $endDate->format('Y-m-d') : null,
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        if ($user->role === 'owner') {
            $user->delete(); // Cascades and deletes space
            return response()->json(['message' => 'تم حذف صاحب المساحة بنجاح']);
        }
        return response()->json(['error' => 'Unauthorized'], 403);
    }
}
