<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Record extends Model
{
    use HasFactory;

    // Define the relationship: Procedure belongs to Asset
    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
