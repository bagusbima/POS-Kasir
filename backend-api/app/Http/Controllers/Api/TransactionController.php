<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'total_price' => 'required|integer',
            'items' => 'required|array',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $transaction = Transaction::create([
                    'total_price' => $request->total_price,
                ]);

                foreach ($request->items as $item) {
                    // Ambil data produk terbaru dari DB
                    $product = Product::lockForUpdate()->find($item['id']);

                    // CEK STOK: Jika stok di DB lebih kecil dari yang diminta
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stok produk {$product->name} tidak mencukupi!");
                    }

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id'     => $item['id'],
                        'quantity'       => $item['quantity'],
                        'subtotal'       => $item['price'] * $item['quantity'],
                    ]);

                    // Kurangi stok
                    $product->decrement('stock', $item['quantity']);
                }

                return response()->json(['message' => 'Transaksi Berhasil!']);
            });
        } catch (\Exception $e) {
            // Jika ada error/stok kurang, transaksi dibatalkan otomatis oleh DB::transaction
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
    public function index(){
        return Transaction::with(['details.product'])
        ->latest()
        ->get();
    }
}