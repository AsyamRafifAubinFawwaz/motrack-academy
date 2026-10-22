<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['type', 'label', 'account_name', 'account_number', 'qr_image', 'is_active'])]
class PaymentMethod extends Model
{
    use SoftDeletes;

    protected $table = 'payment_methods';

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
