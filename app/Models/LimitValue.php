<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LimitValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'control_id',
        'option_value',
        'min_value',
        'max_value',
        'text_value',
        'is_deleted',
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
    ];

    public function control()
    {
        return $this->belongsTo(Control::class);
    }
}
