<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetType extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_type_name',
        'is_deleted',
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
    ];

    // Relationship: AssetType has many Assets
    public function assets()
    {
        return $this->hasMany(Asset::class);
    }

    // Relationship: AssetType has many ControlTypes
    public function controlTypes()
    {
        return $this->hasMany(ControlType::class);
    }

    // Scope to exclude soft-deleted rows
    public function scopeNotDeleted($query)
    {
        return $query->where('is_deleted', false);
    }
}
