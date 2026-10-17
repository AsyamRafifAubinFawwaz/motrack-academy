<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['assignment_id', 'student_id', 'file_path', 'submission_text', 'grade', 'feedback'])]
class Submission extends Model
{
    use SoftDeletes;

    protected $table = 'submissions';

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
