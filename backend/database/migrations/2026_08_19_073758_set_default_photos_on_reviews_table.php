<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('reviews')->whereNull('photos')->update(['photos' => '[]']);

        Schema::table('reviews', function (Blueprint $table) {
            $table->json('photos')->nullable(false)->default('[]')->change();
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->json('photos')->nullable()->default(null)->change();
        });
    }
};
