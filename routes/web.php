<?php

use App\Http\Controllers\AuthenticatedSessionController;
use App\Http\Controllers\WebController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

Route::get('login', [AuthenticatedSessionController::class, 'login'])->name('login');
Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login.attemps');
Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

Route::middleware(['auth'])->group(function () {
    Route::get('/', [WebController::class, 'index'])->name('index');

    Route::post('/record/store', [WebController::class, 'RecordStore'])->name('record.store');

});

Route::middleware(AdminMiddleware::class)->group(function () {
    Route::get('/assets/main', [WebController::class, 'AssetsMain'])->name('assets.main');
    Route::get('/assets/create', [WebController::class, 'AssetsCreate'])->name('assets.create');
    Route::post('/assets/store', [WebController::class, 'AssetsStore'])->name('assets.store');
    Route::get('/assets/edit/{id}', [WebController::class, 'AssetsEdit'])->name('assets.edit');
    Route::put('/assets/{id}', [WebController::class, 'AssetsUpdate'])->name('assets.update');
    Route::delete('/assets/{id}', [WebController::class, 'AssetsDestroy'])->name('assets.destroy');

    Route::get('/controls/main', [WebController::class, 'ContolsMain'])->name('controls.main');
    Route::get('/controls/create', [WebController::class, 'ContolsCreate'])->name('controls.create');
    Route::post('/controls/store', [WebController::class, 'ContolsStore'])->name('controls.store');
    Route::get('/controls/edit/{id}', [WebController::class, 'ContolsEdit'])->name('controls.edit');
    Route::delete('/assets/{id}', [WebController::class, 'ContolsDestroy'])->name('controls.destroy');

    Route::get('/users/main', [WebController::class, 'UsersMain'])->name('users.main');
    Route::post('/users/store', [WebController::class, 'UsersStore'])->name('users.store');
    Route::post('/users/admin', [WebController::class, 'UsersAdmin'])->name('users.admin');
    Route::delete('/users/{id}', [WebController::class, 'UsersDestroy'])->name('users.destroy');
});
