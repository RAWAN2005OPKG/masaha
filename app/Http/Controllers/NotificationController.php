<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Resolve authenticated user from Sanctum token (works even outside auth middleware).
     */
    private function resolveUser(Request $request)
    {
        // Try standard sanctum guard first
        $user = $request->user('sanctum') ?? $request->user();

        // Fallback: manually resolve from bearer token
        if (!$user && $request->bearerToken()) {
            $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
            if ($tokenModel) {
                $user = $tokenModel->tokenable;
            }
        }

        return $user;
    }

    /**
     * Get notifications for the authenticated user based on user_id and role.
     */
    public function index(Request $request)
    {
        $user = $this->resolveUser($request);

        if (!$user) {
            $query = Notification::where('target_role', 'all')
                ->orWhereNull('target_role')
                ->orderBy('created_at', 'desc');
        } elseif ($user->role === 'admin') {
            $query = Notification::orderBy('created_at', 'desc');
        } else {
            $query = Notification::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('target_role', $user->role)
                  ->orWhere('target_role', 'all')
                  ->orWhereNull('target_role');
            })->orderBy('created_at', 'desc');
        }

        $notifications = $query->take(50)->get()->map(function ($n) {
            return [
                'id' => $n->id,
                'title' => $n->title,
                'desc' => $n->desc ?: $n->message,
                'message' => $n->desc ?: $n->message,
                'description' => $n->desc ?: $n->message,
                'type' => $n->type ?: 'system',
                'space_id' => $n->space_id,
                'is_read' => (bool)$n->is_read,
                'read' => (bool)$n->is_read,
                'unread' => !(bool)$n->is_read,
                'time' => $n->created_at ? $n->created_at->diffForHumans() : 'الآن',
                'created_at' => $n->created_at ? $n->created_at->toDateTimeString() : null,
                'data' => $n->data,
            ];
        });

        $unreadCount = $notifications->where('is_read', false)->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark all notifications for the current user as read.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $this->resolveUser($request);

        if ($user) {
            Notification::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('target_role', $user->role)
                  ->orWhere('target_role', 'all');
            })->update(['is_read' => true]);
        } else {
            Notification::query()->update(['is_read' => true]);
        }

        return response()->json(['message' => 'تم تحديد جميع الإشعارات كمقروءة']);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $this->resolveUser($request);

        if ($user) {
            $notification = Notification::where('id', $id)
                ->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->orWhere('target_role', $user->role)
                      ->orWhere('target_role', 'all');
                })->first();
        } else {
            $notification = Notification::find($id);
        }

        if ($notification) {
            $notification->update(['is_read' => true]);
        }

        return response()->json(['message' => 'تم تحديث حالة الإشعار', 'notification' => $notification]);
    }

    /**
     * Send a notification (Admin / System broadcast).
     */
    public function send(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'desc' => 'required|string',
            'target_role' => 'nullable|string', // user, receptionist, owner, admin, all
            'type' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
            'space_id' => 'nullable|exists:spaces,id',
        ]);

        $notification = Notification::create([
            'user_id' => $request->user_id,
            'target_role' => $request->target_role ?: 'all',
            'space_id' => $request->space_id,
            'type' => $request->type ?: 'system',
            'title' => $request->title,
            'desc' => $request->desc,
            'is_read' => false,
            'data' => $request->data,
        ]);

        return response()->json([
            'message' => 'تم إرسال الإشعار بنجاح',
            'notification' => $notification,
        ]);
    }
}
