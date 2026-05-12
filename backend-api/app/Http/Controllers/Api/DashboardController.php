<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'stats' => [
                'total_revenue' => (int) Transaction::sum('total_price'),
                'total_products' => Product::count(),
                'total_transactions' => Transaction::count(),
            ],
            'chart_data' => Transaction::select(
                DB::raw("TO_CHAR(created_at, 'Mon') as month"),
                DB::raw("SUM(total_price) as total")
            )
            ->groupBy('month')
            ->get()
        ]);
    }
    public function getTopProducts()
    {
        $topProducts = TransactionDetail::select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->with('product:id,name,price')
            ->groupBy('product_id')
            ->orderByDesc('total_sold', 'sold')
            ->take(5)
            ->get();
    }
    }