<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('hotel')->nullable()->after('name');
            $table->unsignedInteger('original_price')->nullable()->after('price');
            $table->string('bed')->nullable()->after('capacity');
            $table->unsignedInteger('size')->nullable()->after('bed');
            $table->unsignedInteger('total_rooms')->default(1)->after('size');
            $table->string('status')->default('active')->after('total_rooms');
            $table->boolean('featured')->default(false)->after('status');
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->string('code')->nullable()->unique()->after('id');
            $table->unsignedInteger('guests')->default(1)->after('end_date');
            $table->unsignedInteger('rooms_count')->default(1)->after('guests');
            $table->text('special_request')->nullable()->after('rooms_count');
        });

        Schema::table('amenities', function (Blueprint $table) {
            $table->string('icon')->nullable()->after('name');
        });

        Schema::table('promo_codes', function (Blueprint $table) {
            $table->unsignedInteger('max_discount')->nullable()->after('discount_value');
            $table->string('description')->nullable()->after('active');
        });

        Schema::create('blocked_dates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->date('date');
            $table->timestamps();
            $table->unique(['room_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blocked_dates');

        Schema::table('promo_codes', function (Blueprint $table) {
            $table->dropColumn(['max_discount', 'description']);
        });

        Schema::table('amenities', function (Blueprint $table) {
            $table->dropColumn('icon');
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn(['code', 'guests', 'rooms_count', 'special_request']);
        });

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn(['hotel', 'original_price', 'bed', 'size', 'total_rooms', 'status', 'featured']);
        });
    }
};
