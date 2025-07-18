<?php
namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Control extends Model
{
    use HasFactory;

    protected $casts = [
        'expired' => 'datetime',
    ];

    public function getExpiredAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('d/M/Y') : null;
    }

    // Define the relationship: Procedure belongs to Asset
    public function procedure()
    {
        return $this->belongsTo(Procedure::class);
    }
}
