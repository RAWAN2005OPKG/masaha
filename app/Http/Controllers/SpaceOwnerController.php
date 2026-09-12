<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Space;
use Illuminate\Support\Facades\Hash;

class SpaceOwnerController extends Controller
{
    public function index()
    {
        $owners = User::where('role', 'owner')->with('spaces')->get();
        
        $data = $owners->map(function ($owner) {
            $space = $owner->spaces->first(); // Assuming one space per owner for now based on UI creation
            return [
                'id' => $owner->id,
                'name' => $owner->name,
                'email' => $owner->email,
                'initial' => mb_substr($owner->name, 0, 1),
                'avatarColor' => 'bg-violet-600',
                'price' => $space ? $space->sub_price : 0,
                'spaces' => $owner->spaces->count(),
                'startDate' => $space && $space->sub_start_date ? $space->sub_start_date->format('Y-m-d') : null,
                'endDate' => $space && $space->sub_end_date ? $space->sub_end_date->format('Y-m-d') : null,
                'isManualDisabled' => $space ? $space->is_manual_disabled : false,
            ];
        });

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'spaceName' => 'required|string',
            'phone' => 'nullable|string|unique:users,phone',
            'region' => 'required|string',
            'internet' => 'nullable|string',
            'seats' => 'required|numeric',
            'electricity' => 'nullable|string',
            'pricePerHour' => 'required|numeric',
            'services' => 'nullable|string',
            'startDate' => 'required|date',
            'duration' => 'required|numeric',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'owner',
        ]);

        $startDate = \Carbon\Carbon::parse($request->startDate);
        $endDate = $startDate->copy()->addMonths($request->duration);

        Space::create([
            'user_id' => $user->id,
            'name' => $request->spaceName,
            'phone' => $request->phone,
            'region' => $request->region,
            'internet_speed' => $request->internet,
            'total_seats' => $request->seats,
            'electricity' => $request->electricity,
            'price_per_hour' => $request->pricePerHour,
            'services' => $request->services,
            'sub_start_date' => $startDate,
            'sub_duration_months' => $request->duration,
            'sub_end_date' => $endDate,
            'sub_price' => 0, // Admin can set total manually later or calculate
            'is_manual_disabled' => false,
        ]);

        return response()->json(['message' => 'تم إضافة صاحب المساحة بنجاح']);
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
        
        return response()->json(['message' => 'تم تحديث الحالة بنجاح']);
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
            'spaceName' => $space ? $space->name : '',
            'pricePerHour' => $space ? $space->price_per_hour : '',
            'region' => $space ? $space->region : '',
            'internet' => $space ? $space->internet_speed : '',
            'seats' => $space ? $space->total_seats : '',
            'electricity' => $space ? $space->electricity : '',
            'services' => $space ? $space->services : '',
            'duration' => $space ? $space->sub_duration_months : 3,
            'startDate' => $space && $space->sub_start_date ? $space->sub_start_date->format('Y-m-d') : '',
        ]);
    }

    public function update(Request $request, $id)
    {
        $owner = User::findOrFail($id);
        if ($owner->role !== 'owner') return response()->json(['error' => 'Unauthorized'], 403);

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,'.$id,
            'phone' => 'nullable|string|unique:users,phone,'.$id,
        ]);

        $owner->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        if ($request->password) {
            $owner->update(['password' => Hash::make($request->password)]);
        }

        $space = $owner->spaces()->first();
        if ($space) {
            $startDate = \Carbon\Carbon::parse($request->startDate);
            $endDate = $startDate->copy()->addMonths($request->duration);

            $space->update([
                'name' => $request->spaceName,
                'region' => $request->region,
                'price_per_hour' => $request->pricePerHour,
                'total_seats' => $request->seats,
                'internet_speed' => $request->internet,
                'electricity' => $request->electricity,
                'services' => $request->services,
                'sub_start_date' => $startDate,
                'sub_duration_months' => $request->duration,
                'sub_end_date' => $endDate,
            ]);
        }

        return response()->json(['message' => 'تم التحديث بنجاح']);
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
