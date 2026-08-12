<?php

use App\Http\Controllers\Api\AmenityController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\SavedHotelController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/contact', [ContactController::class, 'store']);

Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/provinces', [RoomController::class, 'provinces']);
Route::get('/rooms/availability', [RoomController::class, 'availability']);
Route::get('/rooms/{room}', [RoomController::class, 'show']);

// Authenticated (any logged-in user)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile
    Route::patch('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
    Route::post('/profile/change-password', [\App\Http\Controllers\Api\ProfileController::class, 'changePassword']);

    // Reservations: index returns ALL for admin, OWN for user
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show']);
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy']);

    // Saved hotels
    Route::get('/saved-hotels', [SavedHotelController::class, 'index']);
    Route::post('/saved-hotels', [SavedHotelController::class, 'store']);
    Route::delete('/saved-hotels/{roomId}', [SavedHotelController::class, 'destroy']);
});

// Admin only
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Notifications (polling)
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);

    // Settings
    Route::get('/settings', [\App\Http\Controllers\Api\SettingController::class, 'index']);
    Route::put('/settings', [\App\Http\Controllers\Api\SettingController::class, 'update']);

    Route::post('/rooms', [RoomController::class, 'store']);
    Route::put('/rooms/{room}', [RoomController::class, 'update']);
    Route::patch('/rooms/{room}', [RoomController::class, 'update']);
    Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);
    Route::post('/rooms/upload-image', [RoomController::class, 'uploadImage']);

    Route::patch('/reservations/{reservation}', [ReservationController::class, 'update']);
    Route::get('/admin/stats', [ReservationController::class, 'stats']);

    Route::get('/contacts', [ContactController::class, 'index']);

    Route::get('/amenities', [AmenityController::class, 'index']);
    Route::post('/amenities', [AmenityController::class, 'store']);
    Route::put('/amenities/{amenity}', [AmenityController::class, 'update']);
    Route::delete('/amenities/{amenity}', [AmenityController::class, 'destroy']);
});
