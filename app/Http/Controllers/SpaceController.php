<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Space;
use Carbon\Carbon;

class SpaceController extends Controller
{
    public function index(Request $request)
    {
        // Only show active spaces
        $spaces = Space::where('is_manual_disabled', false)
            ->whereDate('sub_end_date', '>=', now()) // Ensure subscription hasn't ended
            ->get()
            ->map(function ($space) use ($request) {
                // Determine if favorite for current user
                $isFavorite = $space->favoritedBy()->where('user_id', $request->user()->id)->exists();

                return [
                    'id' => $space->id,
                    'name' => $space->name,
                    'price' => $space->price_per_hour,
                    'region' => $space->region,
                    'speed' => $space->internet_speed,
                    'seats' => $space->total_seats,
                    'available' => rand(1, $space->total_seats), // Mock available seats
                    'rating' => 5.0, // Mock space rating
                    'isFavorite' => $isFavorite,
                ];
            });

        return response()->json($spaces);
    }

    public function toggleFavorite(Request $request, $id)
    {
        $space = Space::findOrFail($id);
        $user = $request->user();

        if ($user->spaces()->where('id', $id)->exists()) {
             // You shouldn't favorite your own space if owner, but we allow it for now or ignore it.
        }

        $isFavorite = $space->favoritedBy()->where('user_id', $user->id)->exists();

        if ($isFavorite) {
            $space->favoritedBy()->detach($user->id);
            return response()->json(['status' => 'removed']);
        } else {
            $space->favoritedBy()->attach($user->id);
            return response()->json(['status' => 'added']);
        }
    }

    public function userFavorites(Request $request)
    {
        $favorites = $request->user()->favorites()->get()->map(function($space) {
             return [
                 'id' => $space->id,
                 'name' => $space->name
             ];
        });
        return response()->json($favorites);
    }
}
