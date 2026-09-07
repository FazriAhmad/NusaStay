<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->unsignedInteger('subtotal')->default(0)->after('price');
            $table->unsignedInteger('tax_amount')->default(0)->after('subtotal');
            $table->unsignedInteger('service_fee')->default(0)->after('tax_amount');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'tax_amount', 'service_fee']);
        });
    }
};
