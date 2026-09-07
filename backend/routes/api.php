<?php

use App\Http\Controllers\Api\AmenityController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\PromoCodeController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\SavedHotelController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/contact', [ContactController::class, 'store']);

Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/provinces', [RoomController::class, 'provinces']);
Route::get('/rooms/availability', [RoomController::class, 'availability']);
Route::get('/rooms/occupancy', [RoomController::class, 'occupancy']);
Route::get('/rooms/{room}', [RoomController::class, 'show']);
Route::get('/rooms/{room}/reviews', [ReviewController::class, 'forRoom']);

Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/amenities', [AmenityController::class, 'index']);
Route::get('/promos', [PromoCodeController::class, 'publicIndex']);
Route::get('/settings', [\App\Http\Controllers\Api\SettingController::class, 'index']);

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
    Route::post('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
    Route::post('/reservations/{reservation}/confirm-payment', [ReservationController::class, 'confirmPayment']);

    // Promo codes
    Route::post('/promo/validate', [PromoCodeController::class, 'validateCode']);

    // Reviews
    Route::post('/reservations/{reservation}/review', [ReviewController::class, 'store']);
    Route::post('/reviews/upload-photo', [ReviewController::class, 'uploadPhoto']);

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
    Route::put('/settings', [\App\Http\Controllers\Api\SettingController::class, 'update']);

    // Blocked dates (availability calendar)
    Route::post('/blocked-dates/toggle', [\App\Http\Controllers\Api\BlockedDateController::class, 'toggle']);

    Route::post('/rooms', [RoomController::class, 'store']);
    Route::put('/rooms/{room}', [RoomController::class, 'update']);
    Route::patch('/rooms/{room}', [RoomController::class, 'update']);
    Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);
    Route::post('/rooms/upload-image', [RoomController::class, 'uploadImage']);

    Route::patch('/reservations/{reservation}', [ReservationController::class, 'update']);
    Route::patch('/reservations/{reservation}/refund', [ReservationController::class, 'refund']);
    Route::get('/admin/stats', [ReservationController::class, 'stats']);

    Route::get('/admin/reports/summary', [\App\Http\Controllers\Api\ReportController::class, 'summary']);
    Route::get('/admin/reports/export', [\App\Http\Controllers\Api\ReportController::class, 'exportBookings']);

    Route::get('/contacts', [ContactController::class, 'index']);
    Route::patch('/contacts/{contact}', [ContactController::class, 'update']);
    Route::delete('/contacts/{contact}', [ContactController::class, 'destroy']);

    Route::get('/promo-codes', [PromoCodeController::class, 'index']);
    Route::post('/promo-codes', [PromoCodeController::class, 'store']);
    Route::put('/promo-codes/{promoCode}', [PromoCodeController::class, 'update']);
    Route::delete('/promo-codes/{promoCode}', [PromoCodeController::class, 'destroy']);

    Route::post('/amenities', [AmenityController::class, 'store']);
    Route::put('/amenities/{amenity}', [AmenityController::class, 'update']);
    Route::delete('/amenities/{amenity}', [AmenityController::class, 'destroy']);
});
