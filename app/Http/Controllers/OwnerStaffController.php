<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class OwnerStaffController extends Controller
{
    public function index()
    {
        $owner = Auth::user();
        if ($owner->role !== 'owner') return response()->json(['error' => 'Unauthorized'], 403);

        $staff = User::where('owner_id', $owner->id)->where('role', 'receptionist')->get();
        return response()->json($staff);
    }

    public function store(Request $request)
    {
        $owner = Auth::user();
        if ($owner->role !== 'owner') return response()->json(['error' => 'Unauthorized'], 403);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $staff = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'receptionist',
            'owner_id' => $owner->id,
            'status' => 'active',
        ]);

        return response()->json(['message' => 'تم إضافة الموظف بنجاح', 'staff' => $staff]);
    }

    public function update(Request $request, $id)
    {
        $owner = Auth::user();
        $staff = User::where('owner_id', $owner->id)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
        ]);

        $staff->update([
            'name' => $request->name,
            'email' => $request->email,
            'status' => $request->status ?? $staff->status,
        ]);

        if ($request->filled('password')) {
            $staff->update(['password' => Hash::make($request->password)]);
        }

        return response()->json(['message' => 'تم تعديل الموظف بنجاح', 'staff' => $staff]);
    }

    public function destroy($id)
    {
        $owner = Auth::user();
        $staff = User::where('owner_id', $owner->id)->findOrFail($id);
        $staff->delete();

        return response()->json(['message' => 'تم حذف الموظف بنجاح']);
    }
}
