<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('asset_type_id');
            $table->string('name');
            $table->string('frequency')->nullable();
            $table->string('environment')->nullable();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('location')->nullable();
            $table->string('memo')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();
        });

        Schema::create('asset_types', function (Blueprint $table) {
            $table->id();
            $table->string('asset_type_name');
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();
        });

        Schema::create('control_types', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('asset_type_id');
            $table->string('control_type_name');
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();
        });

        Schema::create('controls', function (Blueprint $table) {
            $table->id();
            $table->string('control_name');
            $table->unsignedBigInteger('control_type_id');
            $table->string('brand')->nullable();
            $table->string('lot')->nullable();
            $table->datetime('expired')->nullable();
            $table->enum('limit_type', ['range', 'option', 'text']);
            $table->string('memo')->nullable();
            $table->boolean('is_active')->default(false);
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();
        });

        Schema::create('limit_values', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('control_id');
            $table->string('option_value')->nullable();
            $table->string('min_value')->nullable();
            $table->string('max_value')->nullable();
            $table->string('text_value')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();
        });

        Schema::create('records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('control_type_id');
            $table->string('record_value');
            $table->string('record_result')->nullable();
            $table->string('verified_by')->nullable();
            $table->string('approved_by')->nullable();
            $table->string('memo')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
        Schema::dropIfExists('asset_types');
        Schema::dropIfExists('control_types');
        Schema::dropIfExists('controls');
        Schema::dropIfExists('limit_values');
        Schema::dropIfExists('records');
    }
};
