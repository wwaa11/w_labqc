<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ControlType extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_type_id',
        'control_type_name',
        'is_deleted',
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
    ];

    public function assetType()
    {
        return $this->belongsTo(AssetType::class);
    }

    public function controls()
    {
        return $this->hasMany(Control::class);
    }

    public function records()
    {
        return $this->hasMany(Record::class);
    }

    // Scope to exclude soft-deleted rows
    public function scopeNotDeleted($query)
    {
        return $query->where('is_deleted', false);
    }
}
