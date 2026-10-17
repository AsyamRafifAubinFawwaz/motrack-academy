<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['course_id', 'title', 'content', 'youtube_url', 'file_path', 'order'])]
class Material extends Model
{
    use SoftDeletes;

    protected $table = 'materials';

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }
}
