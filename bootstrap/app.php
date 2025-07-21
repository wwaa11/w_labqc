<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (HttpException $e, $request) {
            $status = $e->getStatusCode();
            if ($status === 404) {
                Log::warning('404 Not Found', [
                    'url'     => $request->fullUrl(),
                    'user_id' => optional($request->user())->id,
                    'message' => $e->getMessage(),
                ]);
                return inertia('errors/404', [
                    'status'  => 404,
                    'message' => 'Page not found.',
                ])->toResponse($request)->setStatusCode(404);
            }
            if ($status === 500) {
                Log::error('500 Internal Server Error', [
                    'url'     => $request->fullUrl(),
                    'user_id' => optional($request->user())->id,
                    'message' => $e->getMessage(),
                ]);
                return inertia('errors/500', [
                    'status'  => 500,
                    'message' => 'Internal server error.',
                ])->toResponse($request)->setStatusCode(500);
            }
        });
    })->create();
