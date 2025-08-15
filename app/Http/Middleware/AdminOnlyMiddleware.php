<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminOnlyMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check() && (auth()->user()->role === 'admin' || auth()->user()->role === 'superadmin')) {
            return $next($request);
        }
        abort(403);
    }
}
