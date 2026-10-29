<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'fullName' => 'required|string|min:3',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|min:9|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->fullName,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'تم إنشاء الحساب بنجاح',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['بيانات الدخول غير صحيحة.'],
            ]);
        }

        // Check Owner subscription start & end dates
        if ($user->role === 'owner') {
            $space = \App\Models\Space::where('user_id', $user->id)->first();
            if ($space) {
                $today = \Carbon\Carbon::today();
                $startDate = $space->sub_start_date ? \Carbon\Carbon::parse($space->sub_start_date)->startOfDay() : null;
                $endDate = $space->sub_end_date ? \Carbon\Carbon::parse($space->sub_end_date)->startOfDay() : null;

                // 1. Not started yet
                if ($startDate && $today->lt($startDate)) {
                    throw ValidationException::withMessages([
                        'email' => ["طلبك قيد المراجعة / لم يحن موعد اشتراكك بعد. سيبدأ اشتراكك بتاريخ ({$startDate->format('Y/m/d')}). سيتم تمكين الدخول للوحة التحكم فور بدء الموعد أو تفعيل حسابك."],
                    ]);
                }

                // 2. Expired
                if ($endDate && $today->gt($endDate)) {
                    throw ValidationException::withMessages([
                        'email' => ["انتهت فترة اشتراكك بتاريخ ({$endDate->format('Y/m/d')}). تم إيقاف الوصول إلى لوحة التحكم، يرجى التواصل مع الإدارة لتجديد الاشتراك."],
                    ]);
                }

                // 3. Manual disabled
                if ($space->is_manual_disabled && !$space->emergency_reason) {
                    throw ValidationException::withMessages([
                        'email' => ['تم إيقاف حساب المساحة من قِبل الإدارة. يرجى مراجعة إدارة المنصة.'],
                    ]);
                }
            }
        }

        try {
            $user->update(['last_activity_at' => now()]);
        } catch (\Throwable $e) {}

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'تم تسجيل الخروج بنجاح'
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'name' => 'sometimes|string|min:3',
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'sometimes|string|min:9|unique:users,phone,'.$user->id,
            'password' => 'nullable|string|min:6',
            'rating' => 'sometimes|numeric|min:1|max:5',
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        if ($request->has('rating')) {
            $user->rating = $request->rating;
        }

        if ($request->hasFile('avatar')) {
            $request->validate(['avatar' => 'image|mimes:jpeg,png,jpg,gif|max:2048']);
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = asset('storage/' . $path);
        }

        $user->save();

        return response()->json([
            'message' => 'تم التحديث بنجاح',
            'user' => $user
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);
        
        $code = rand(100000, 999999);
        
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => $code, 'created_at' => now()]
        );
        
        $mailSent = false;
        $mailError = null;
        try {
            \Illuminate\Support\Facades\Mail::to($request->email)->send(new \App\Mail\ResetPasswordCodeMail($code));
            $mailSent = true;
        } catch (\Exception $e) {
            $mailError = $e->getMessage();
        }

        // In development/local environment, return the code directly as a fallback
        if (!$mailSent) {
            if (config('app.env') === 'local' || config('app.debug')) {
                return response()->json([
                    'message' => 'تعذّر إرسال البريد الإلكتروني. رمز التحقق (للتطوير فقط): ' . $code,
                    'debug_code' => $code,
                    'mail_error' => $mailError,
                ], 200);
            }
            return response()->json(['message' => 'حدث خطأ أثناء إرسال البريد الإلكتروني. يرجى التواصل مع الدعم الفني.'], 500);
        }
        
        return response()->json(['message' => 'تم إرسال رمز التحقق إلى بريدك الإلكتروني.']);
    }

    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string',
        ]);
        
        $resetRequest = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->code)
            ->first();
            
        if (!$resetRequest || \Carbon\Carbon::parse($resetRequest->created_at)->addMinutes(15)->isPast()) {
            if ($resetRequest) {
                \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            }
            return response()->json(['message' => 'رمز التحقق غير صحيح أو انتهت صلاحيته (صالح لمدة 15 دقيقة فقط).'], 400);
        }
        
        return response()->json(['message' => 'رمز التحقق صحيح.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string',
            'password' => 'required|string|min:6',
        ]);
        
        $resetRequest = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->code)
            ->first();
            
        if (!$resetRequest || \Carbon\Carbon::parse($resetRequest->created_at)->addMinutes(15)->isPast()) {
            if ($resetRequest) {
                \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            }
            return response()->json(['message' => 'رمز التحقق غير صحيح أو انتهت صلاحيته (صالح لمدة 15 دقيقة فقط).'], 400);
        }
        
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();
        
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        
        return response()->json(['message' => 'تم إعادة تعيين كلمة المرور بنجاح.']);
    }
}
