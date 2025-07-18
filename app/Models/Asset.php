<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'environment',
        'frequency',
        'brand',
        'model',
        'serial_number',
        'location',
        'memo',
    ];

    public function procedures()
    {
        return $this->hasmany(Procedure::class);
    }
}
