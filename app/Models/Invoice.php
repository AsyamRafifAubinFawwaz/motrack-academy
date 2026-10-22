<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['invoice_number', 'student_id', 'course_id', 'amount', 'issuer_details', 'payment_proof', 'pdf_path', 'status'])]
class Invoice extends Model
{
    use SoftDeletes;

    protected $table = 'invoices';

    protected function casts(): array
    {
        return [
            'issuer_details' => 'array',
        ];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
