<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Procedure extends Model
{
    use HasFactory;

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function control()
    {
        return $this->belongsTo(Control::class);
    }

    public function records()
    {
        return $this->hasmany(Record::class)->orderBy('created_at', 'ASC')->get();
    }

    public function last_record()
    {
        return $this->hasone(Record::class)->orderBy('created_at', 'DESC');
    }

}
