<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->decimal('avg_rating', 3, 2)->default(0);
            $table->unsignedInteger('review_count')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn(['avg_rating', 'review_count']);
        });
    }
};
