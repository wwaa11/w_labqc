<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Control extends Model
{
    use HasFactory;

    protected $fillable = [
        'control_name',
        'control_type_id',
        'brand',
        'lot',
        'expired',
        'limit_type',
        'memo',
        'is_active',
        'is_deleted',
    ];

    protected $casts = [
        'expired'    => 'datetime',
        'is_active'  => 'boolean',
        'is_deleted' => 'boolean',
    ];

    public function controlType()
    {
        return $this->belongsTo(ControlType::class);
    }

    public function limitValues()
    {
        return $this->hasOne(LimitValue::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
