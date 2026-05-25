<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'company',
        'source',
        'status',
        'priority',
        'notes',
        'follow_up_date',
        'estimated_value',
    ];

    public function notes()
    {
        return $this->hasMany(LeadNote::class);
    }

    public function activities()
    {
        return $this->hasMany(LeadActivity::class)->latest();
    }
}
