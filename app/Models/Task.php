<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    /**
     * 複数代入可能な属性
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'due_date',
        'assigned_to',
        'project_id',
        'created_by',
        'is_shared',
        'shared_at',
        'is_all_day',
    ];

    /**
     * 日付として扱う属性
     *
     * @var array
     */
    protected $dates = [
        'due_date',
        'shared_at',
        'created_at',
        'updated_at',
    ];

    /**
     * JSONに含める属性
     *
     * @var array
     */
    protected $appends = [
        'assigned_to_username',
        'created_by_username',
    ];

    /**
     * タスクの担当者
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * タスクの作成者
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 担当者のユーザー名を取得
     */
    public function getAssignedToUsernameAttribute()
    {
        return $this->assignedTo ? $this->assignedTo->username : null;
    }

    /**
     * 作成者のユーザー名を取得
     */
    public function getCreatedByUsernameAttribute()
    {
        return $this->createdBy ? $this->createdBy->username : null;
    }
}
