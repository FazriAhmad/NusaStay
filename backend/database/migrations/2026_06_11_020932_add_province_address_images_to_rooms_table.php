<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->string('province')->nullable()->after('capacity');
            $table->string('city')->nullable()->after('province');
            $table->string('address')->nullable()->after('city');
            $table->json('images')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn(['province', 'city', 'address', 'images']);
        });
    }
};
