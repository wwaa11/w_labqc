<?php

use App\Http\Controllers\AuthenticatedSessionController;
use App\Http\Controllers\WebController;
use App\Http\Middleware\AdminOnlyMiddleware;
use App\Http\Middleware\SuperAdminMiddleware;
use Illuminate\Support\Facades\Route;

// Authentication
Route::controller(AuthenticatedSessionController::class)->group(function () {
    Route::get('login', 'login')->name('login');
    Route::post('login', 'store')->name('login.attemps');
    Route::post('logout', 'destroy')->name('logout');
});

// Authenticated application routes
Route::middleware(['auth'])->group(function () {

    Route::get('/', function () {
        return redirect()->route('users.dashboard');
    })->name('index');

    Route::prefix('users')->as('users.')->controller(WebController::class)->group(function () {
        Route::get('dashboard', 'UserAssets')->name('dashboard');
        Route::post('records/store', 'RecordsStore')->name('records.store');
        Route::get('guide', 'UserGuide')->name('guide');
    });

    // SuperAdmin-only management areas (Asset Types & Control Types)
    Route::middleware(SuperAdminMiddleware::class)->group(function () {
        // Asset Type Management Routes (SuperAdmin only)
        Route::prefix('asset-types')->as('asset-types.')->controller(WebController::class)->group(function () {
            Route::get('main', 'AssetTypesMain')->name('main');
            Route::get('create', 'AssetTypesCreate')->name('create');
            Route::post('store', 'AssetTypesStore')->name('store');
            Route::get('edit/{id}', 'AssetTypesEdit')->name('edit');
            Route::post('update/{id}', 'AssetTypesUpdate')->name('update');
            Route::delete('{id}', 'AssetTypesDestroy')->name('destroy');
        });

        // Control Type Management Routes (SuperAdmin only)
        Route::prefix('control-types')->as('control-types.')->controller(WebController::class)->group(function () {
            Route::get('main', 'ControlTypesMain')->name('main');
            Route::get('create', 'ControlTypesCreate')->name('create');
            Route::post('store', 'ControlTypesStore')->name('store');
            Route::get('edit/{id}', 'ControlTypesEdit')->name('edit');
            Route::post('update/{id}', 'ControlTypesUpdate')->name('update');
            Route::delete('{id}', 'ControlTypesDestroy')->name('destroy');
        });
    });

    // Admin and SuperAdmin management areas
    Route::middleware(AdminOnlyMiddleware::class)->group(function () {
        // Users Management Routes (Admin & SuperAdmin)
        Route::prefix('roles')->as('roles.')->controller(WebController::class)->group(function () {
            Route::get('main', 'RolesMain')->name('main');
            Route::post('store', 'RolesStore')->name('store');
            Route::post('admin', 'RolesAdmin')->name('admin');
            Route::post('mass-assign-location', 'RolesMassAssignLocation')->name('massAssignLocation');
            Route::delete('{id}', 'RolesDestroy')->name('destroy');
        });

        // Controls Management Routes (Admin & SuperAdmin)
        Route::prefix('controls')->as('controls.')->controller(WebController::class)->group(function () {
            Route::get('main', 'ControlsMain')->name('main');
            Route::get('create', 'ControlsCreate')->name('create');
            Route::post('store', 'ControlsStore')->name('store');
            Route::get('edit/{id}', 'ControlsEdit')->name('edit');
            Route::post('update/{id}', 'ControlsUpdate')->name('update');
            Route::delete('{id}', 'ControlsDestroy')->name('destroy');
            Route::post('set-active/{id}', 'ControlsSetActive')->name('setActive');
            Route::post('set-inactive/{id}', 'ControlsSetInactive')->name('setInactive');
        });

        // Assets Management Routes (Admin & SuperAdmin)
        Route::prefix('assets')->as('assets.')->controller(WebController::class)->group(function () {
            Route::get('main', 'AssetsMain')->name('main');
            Route::get('overview', 'AssetsOverview')->name('overview');
            Route::get('create', 'AssetsCreate')->name('create');
            Route::post('store', 'AssetsStore')->name('store');
            Route::get('edit/{id}', 'AssetsEdit')->name('edit');
            Route::post('update/{id}', 'AssetsUpdate')->name('update');
            Route::delete('{id}', 'AssetsDestroy')->name('destroy');
        });

        // Records Management Routes (Admin & SuperAdmin)
        Route::prefix('records')->as('records.')->controller(WebController::class)->group(function () {
            Route::get('main', 'RecordsMain')->name('main');
            Route::get('asset/{assetId}', 'RecordsByAsset')->name('byAsset');
            Route::post('asset/{assetId}/store', 'RecordsByAssetStore')->name('byAsset.store');
            Route::delete('asset/{assetId}/destroy/{recordId}', 'RecordsByAssetDestroy')->name('byAsset.destroy');
            Route::post('asset/{assetId}/approve/{recordId}', 'RecordsByAssetApprove')->name('byAsset.approve');
            Route::post('approve/{id}', 'RecordsApprove')->name('approve');
            Route::delete('remove/{id}', 'RecordsRemove')->name('remove');
            Route::post('restore/{id}', 'RecordsRestore')->name('restore');
        });

    });

});
