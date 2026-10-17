<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'description', 'price', 'cover_image'])]
class Course extends Model
{
    use SoftDeletes;

    protected $table = 'courses';

    public function mentors()
    {
        return $this->belongsToMany(User::class, 'course_mentor', 'course_id', 'mentor_id')->withTimestamps();
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'course_student', 'course_id', 'student_id')
            ->withPivot('mentor_id', 'status')
            ->withTimestamps();
    }

    public function materials()
    {
        return $this->hasMany(Material::class)->orderBy('order');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
