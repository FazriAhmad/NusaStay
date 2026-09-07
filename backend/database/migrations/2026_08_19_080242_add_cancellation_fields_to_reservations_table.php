<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->text('cancellation_reason')->nullable();
            $table->string('refund_status')->default('none'); // none, requested, approved, rejected
            $table->string('cancelled_by')->nullable(); // user, admin, system
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['cancellation_reason', 'refund_status', 'cancelled_by']);
        });
    }
};
