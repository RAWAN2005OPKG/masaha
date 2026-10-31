<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Space;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Carbon\Carbon;

class SpaceOwnerController extends Controller
{
    /**
     * Auto-ensure database columns exist if migrations were not executed manually.
     */
    private function ensureColumnsExist()
    {
        try {
            if (!Schema::hasColumn('users', 'birth_date')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->date('birth_date')->nullable()->after('phone');
                });
            }
        } catch (\Throwable $e) {}

        try {
            if (!Schema::hasColumn('users', 'last_activity_at')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->timestamp('last_activity_at')->nullable()->after('remember_token');
                });
            }
        } catch (\Throwable $e) {}

        try {
            if (!Schema::hasColumn('spaces', 'sub_duration_unit')) {
                Schema::table('spaces', function (Blueprint $table) {
                    $table->string('sub_duration_unit')->default('months')->after('sub_duration_months');
                });
            }
        } catch (\Throwable $e) {}

        try {
            if (!Schema::hasColumn('spaces', 'sub_duration_value')) {
                Schema::table('spaces', function (Blueprint $table) {
                    $table->integer('sub_duration_value')->default(1)->after('sub_duration_unit');
                });
            }
        } catch (\Throwable $e) {}
    }

    public function index()
    {
        $this->ensureColumnsExist();
        $owners = User::where('role', 'owner')->with('spaces')->get();
        $today = Carbon::today();
        $hasBirthDate = Schema::hasColumn('users', 'birth_date');
        $hasDurationUnit = Schema::hasColumn('spaces', 'sub_duration_unit');
        
        $data = $owners->map(function ($owner) use ($today, $hasBirthDate, $hasDurationUnit) {
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
                'birthDate' => ($hasBirthDate && $owner->birth_date) ? Carbon::parse($owner->birth_date)->format('Y-m-d') : null,
                'initial' => mb_substr($owner->name, 0, 1),
                'avatarColor' => 'bg-violet-600',
                'price' => $space ? $space->sub_price : 0,
                'spaces' => $owner->spaces->count(),
                'spaceName' => $space ? $space->name : '',
                'startDate' => $startDate ? $startDate->format('Y-m-d') : null,
                'endDate' => $endDate ? $endDate->format('Y-m-d') : null,
                'duration' => $space ? (($hasDurationUnit && $space->sub_duration_value) ? $space->sub_duration_value : ($space->sub_duration_months ?: 1)) : 1,
                'durationUnit' => ($space && $hasDurationUnit && $space->sub_duration_unit) ? $space->sub_duration_unit : 'months',
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
        $this->ensureColumnsExist();

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

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'owner',
            'status' => 'active',
        ];

        if (Schema::hasColumn('users', 'birth_date')) {
            $userData['birth_date'] = $request->birthDate;
        }

        $user = User::create($userData);

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

        $spaceData = [
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
            'sub_end_date' => $endDate,
            'sub_price' => 0,
            'is_manual_disabled' => false,
        ];

        if (Schema::hasColumn('spaces', 'sub_duration_unit')) {
            $spaceData['sub_duration_unit'] = $unit;
        }
        if (Schema::hasColumn('spaces', 'sub_duration_value')) {
            $spaceData['sub_duration_value'] = $duration;
        }

        Space::create($spaceData);

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
        $this->ensureColumnsExist();
        $owner = User::with('spaces')->findOrFail($id);
        if ($owner->role !== 'owner') return response()->json(['error' => 'Unauthorized'], 403);

        $space = $owner->spaces->first();
        $hasBirthDate = Schema::hasColumn('users', 'birth_date');
        $hasDurationUnit = Schema::hasColumn('spaces', 'sub_duration_unit');

        return response()->json([
            'id' => $owner->id,
            'name' => $owner->name,
            'email' => $owner->email,
            'phone' => $owner->phone,
            'birthDate' => ($hasBirthDate && $owner->birth_date) ? Carbon::parse($owner->birth_date)->format('Y-m-d') : '',
            'spaceName' => $space ? $space->name : '',
            'pricePerHour' => $space ? $space->price_per_hour : '',
            'pricePrivate' => $space ? $space->price_private : '',
            'priceRoom' => $space ? $space->price_room : '',
            'region' => $space ? $space->region : 'غزة',
            'internet' => $space ? $space->internet_speed : '',
            'seats' => $space ? $space->total_seats : '',
            'electricity' => $space ? $space->electricity : '',
            'services' => $space ? $space->services : '',
            'duration' => $space ? (($hasDurationUnit && $space->sub_duration_value) ? $space->sub_duration_value : ($space->sub_duration_months ?: 3)) : 3,
            'durationUnit' => ($space && $hasDurationUnit && $space->sub_duration_unit) ? $space->sub_duration_unit : 'months',
            'startDate' => $space && $space->sub_start_date ? $space->sub_start_date->format('Y-m-d') : '',
            'endDate' => $space && $space->sub_end_date ? $space->sub_end_date->format('Y-m-d') : '',
        ]);
    }

    public function update(Request $request, $id)
    {
        $this->ensureColumnsExist();
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

        $updateOwnerData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ];

        if (Schema::hasColumn('users', 'birth_date')) {
            $updateOwnerData['birth_date'] = $request->birthDate;
        }

        $owner->update($updateOwnerData);

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

            $spaceUpdateData = [
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
                'sub_end_date' => $endDate,
            ];

            if (Schema::hasColumn('spaces', 'sub_duration_unit')) {
                $spaceUpdateData['sub_duration_unit'] = $unit;
            }
            if (Schema::hasColumn('spaces', 'sub_duration_value')) {
                $spaceUpdateData['sub_duration_value'] = $duration;
            }

            $space->update($spaceUpdateData);
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
