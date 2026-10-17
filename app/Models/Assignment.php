<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['material_id', 'mentor_id', 'title', 'description', 'assign_type'])]
class Assignment extends Model
{
    use SoftDeletes;

    protected $table = 'assignments';

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function mentor()
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'assignment_student', 'assignment_id', 'student_id');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }
}
