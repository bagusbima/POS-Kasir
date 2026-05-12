<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    // Tambahkan baris ini
    protected $fillable = ['total_price', 'created_at'];

    // Relasi ke detail (opsional tapi bagus untuk nanti)
    public function details() {
        return $this->hasMany(TransactionDetail::class);
    }
}