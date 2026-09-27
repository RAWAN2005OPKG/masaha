<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Offer;
use App\Models\Space;
use App\Models\Notification;
use App\Models\User;

class EventOfferController extends Controller
{
    /**
     * Get active and upcoming events.
     */
    public function getEvents(Request $request)
    {
        $events = Event::with('space')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($ev) {
                $statusText = $ev->joined >= $ev->capacity ? 'ممتلئة' : ($ev->status === 'done' ? 'مكتملة' : 'قادمة');
                $progress = $ev->capacity > 0 ? min(100, round(($ev->joined / $ev->capacity) * 100)) : 0;
                return [
                    'id' => $ev->id,
                    'title' => $ev->title,
                    'description' => $ev->description,
                    'date' => $ev->date,
                    'time' => $ev->time,
                    'capacity' => $ev->capacity,
                    'joined' => $ev->joined,
                    'capacityLabel' => "{$ev->joined}/{$ev->capacity}",
                    'progress' => $progress,
                    'status' => $statusText,
                    'statusCode' => $ev->status,
                    'spaceName' => $ev->space ? $ev->space->name : 'المساحة العامة',
                    'spaceLocation' => $ev->space ? ($ev->space->region ?: 'غزة، الرمال') : 'غزة، المقر الرئيسي',
                    'spacePhone' => $ev->space ? $ev->space->phone : '',
                ];
            });

        return response()->json($events);
    }

    /**
     * Join / Register in an event.
     */
    public function joinEvent(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        if ($event->joined >= $event->capacity) {
            return response()->json(['message' => 'عذراً، الفعالية مكتملة العدد ولا يمكن التسجيل.'], 422);
        }

        $event->increment('joined');
        if ($event->joined >= $event->capacity) {
            $event->status = 'done';
            $event->save();
        }

        $user = $request->user('sanctum') ?? $request->user();
        $participantName = $request->name ?: ($user ? $user->name : 'زائر جديد');

        if ($user) {
            Notification::create([
                'user_id' => $user->id,
                'target_role' => 'user',
                'title' => 'تأكيد التسجيل بالفعالية 🎯',
                'desc' => "تم تسجيلك بنجاح في فعالية '{$event->title}' بتاريخ {$event->date} الساعة {$event->time}.",
                'type' => 'booking',
                'is_read' => false,
            ]);
        }

        // Broadcast notification to admin & space management
        Notification::create([
            'target_role' => 'admin',
            'space_id' => $event->space_id,
            'title' => 'مشترك جديد في الفعالية 👥',
            'desc' => "انضم {$participantName} إلى فعالية '{$event->title}' ({$event->joined}/{$event->capacity}).",
            'type' => 'system',
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'تم التسجيل في الفعالية بنجاح!',
            'event' => $event,
        ]);
    }

    /**
     * Get owner events.
     */
    public function ownerEvents(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        $space = ($user ? Space::where('user_id', $user->id)->first() : null) ?? Space::first();

        $eventsQuery = Event::query();
        if ($space) {
            $eventsQuery->where(function ($q) use ($space, $user) {
                $q->where('space_id', $space->id)
                  ->orWhere('user_id', $user->id)
                  ->orWhereNull('space_id');
            });
        }

        $events = $eventsQuery->orderBy('id', 'desc')->get()->map(function ($ev) {
            $statusKey = $ev->joined >= $ev->capacity ? 'done' : ($ev->status ?: 'upcoming');
            return [
                'id' => $ev->id,
                'title' => $ev->title,
                'date' => $ev->date,
                'time' => $ev->time,
                'status' => $statusKey,
                'joined' => $ev->joined,
                'capacity' => $ev->capacity,
            ];
        });

        return response()->json($events);
    }

    /**
     * Store new event created by owner.
     */
    public function storeOwnerEvent(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|string',
            'time' => 'required|string',
            'capacity' => 'required|integer|min:1',
        ]);

        $user = $request->user('sanctum') ?? $request->user();
        $space = ($user ? Space::where('user_id', $user->id)->first() : null) ?? Space::first();

        $event = Event::create([
            'space_id' => $space ? $space->id : null,
            'user_id' => $user ? $user->id : null,
            'title' => $request->title,
            'description' => $request->description,
            'date' => $request->date,
            'time' => $request->time,
            'capacity' => $request->capacity,
            'joined' => 0,
            'status' => 'upcoming',
            'price' => $request->price ?? 0,
        ]);

        // Broadcast to all users and admin
        Notification::create([
            'target_role' => 'all',
            'space_id' => $space ? $space->id : null,
            'title' => 'فعالية جديدة متاحة! 📢',
            'desc' => "تمت إضافة فعالية جديدة: '{$event->title}' في {$event->date} الساعة {$event->time}. سارع بالتسجيل!",
            'type' => 'system',
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'تم إنشاء الفعالية ونشرها بنجاح!',
            'event' => $event,
        ], 201);
    }

    /**
     * Update owner event.
     */
    public function updateOwnerEvent(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|string',
            'time' => 'required|string',
            'capacity' => 'required|integer|min:1',
        ]);

        $event = Event::findOrFail($id);
        $event->update([
            'title' => $request->title,
            'description' => $request->description ?? $event->description,
            'date' => $request->date,
            'time' => $request->time,
            'capacity' => $request->capacity,
        ]);

        return response()->json([
            'message' => 'تم حفظ تعديلات الفعالية بنجاح!',
            'event' => $event,
        ]);
    }

    /**
     * Delete owner event.
     */
    public function deleteOwnerEvent($id)
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return response()->json(['message' => 'تم حذف الفعالية بنجاح.']);
    }

    /**
     * Get active offers for users.
     */
    public function getOffers(Request $request)
    {
        $offers = Offer::with('space')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($offer) {
                return [
                    'id' => $offer->id,
                    'title' => $offer->title,
                    'code' => $offer->code,
                    'discount' => $offer->discount > 0 ? "-{$offer->discount}%" : 'FREE',
                    'discountVal' => $offer->discount,
                    'date' => $offer->expiry,
                    'expiry' => $offer->expiry,
                    'used' => $offer->used,
                    'limit' => $offer->limit,
                    'status' => $offer->status,
                    'spaceName' => $offer->space ? $offer->space->name : 'كافة المساحات',
                    'spaceLocation' => $offer->space ? ($offer->space->region ?: 'غزة') : 'كافة الفروع والمناطق',
                    'spacePhone' => $offer->space ? $offer->space->phone : '',
                    'color' => $offer->discount > 25 
                        ? 'border-brand-500/20 bg-brand-500/5' 
                        : 'border-amber-500/20 bg-amber-500/5',
                ];
            });

        return response()->json($offers);
    }

    /**
     * Get owner offers.
     */
    public function ownerOffers(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user();
        $space = ($user ? Space::where('user_id', $user->id)->first() : null) ?? Space::first();

        $offersQuery = Offer::query();
        if ($space) {
            $offersQuery->where(function ($q) use ($space, $user) {
                $q->where('space_id', $space->id);
                if ($user) {
                    $q->orWhere('user_id', $user->id);
                }
                $q->orWhereNull('space_id');
            });
        }

        $offers = $offersQuery->orderBy('id', 'desc')->get()->map(function ($o) {
            return [
                'id' => $o->id,
                'title' => $o->title,
                'code' => $o->code,
                'status' => $o->status,
                'discount' => $o->discount,
                'expiry' => $o->expiry,
                'used' => $o->used,
                'limit' => $o->limit,
            ];
        });

        return response()->json($offers);
    }

    /**
     * Store new offer created by owner.
     */
    public function storeOwnerOffer(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:offers,code',
            'discount' => 'required|integer|min:1|max:100',
            'expiry' => 'required|string',
        ]);

        $user = $request->user('sanctum') ?? $request->user();
        $space = ($user ? Space::where('user_id', $user->id)->first() : null) ?? Space::first();

        $offer = Offer::create([
            'space_id' => $space ? $space->id : null,
            'user_id' => $user ? $user->id : null,
            'title' => $request->title,
            'code' => strtoupper($request->code),
            'discount' => (int)$request->discount,
            'expiry' => $request->expiry,
            'used' => 0,
            'limit' => $request->limit ?? 100,
            'status' => 'active',
        ]);

        // Broadcast notification to all users and admin
        Notification::create([
            'target_role' => 'all',
            'space_id' => $space ? $space->id : null,
            'title' => 'عرض وخصم جديد! 🏷️',
            'desc' => "استفد من كود الخصم ({$offer->code}) للحصول على خصم {$offer->discount}% على حجزك القادم.",
            'type' => 'promo',
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'تم إطلاق العرض الترويجي بنجاح!',
            'offer' => $offer,
        ], 201);
    }

    /**
     * Delete owner offer.
     */
    public function deleteOwnerOffer($id)
    {
        $offer = Offer::findOrFail($id);
        $offer->delete();

        return response()->json(['message' => 'تم حذف العرض بنجاح.']);
    }
}
