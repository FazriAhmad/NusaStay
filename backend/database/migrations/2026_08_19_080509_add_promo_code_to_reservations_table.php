<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('promo_code_id')->nullable()->constrained('promo_codes')->nullOnDelete();
            $table->unsignedInteger('discount_amount')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('promo_code_id');
            $table->dropColumn('discount_amount');
        });
    }
};
