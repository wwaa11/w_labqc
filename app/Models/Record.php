<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Record extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'control_type_id',
        'record_value',
        'record_result',
        'verified_by',
        'approved_by',
        'memo',
        'is_deleted',
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
    ];

    // Relationship: Record belongs to ControlType
    public function controlType()
    {
        return $this->belongsTo(ControlType::class);
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

}
