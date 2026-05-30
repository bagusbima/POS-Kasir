<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;


class ProductController extends Controller
{
    public function index()
    {
        return Product::with('category')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'price' => 'required|integer',
            'stock' => 'required|integer',
        ]);

        return Product::create($validated);
    }

    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus(Soft Delete)'], 200);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
    }

    // Validasi data yang masuk
    $request->validate([
        'name' => 'required|string|max:255',
        'category_id' => 'required|integer',
        'price' => 'required|numeric',
        'stock' => 'required|integer',
    ]);

    // Update data produk
    $product->update([
        'name' => $request->name,
        'category_id' => $request->category_id,
        'price' => $request->price,
        'stock' => $request->stock,
    ]);

    return response()->json([
        'message' => 'Produk berhasil diperbarui',
        'data' => $product
    ], 200);
}
}