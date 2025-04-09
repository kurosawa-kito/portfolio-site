<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAddedTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'task_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function task()
    {
        return $this->belongsTo(SharedTask::class, 'task_id');
    }
}
