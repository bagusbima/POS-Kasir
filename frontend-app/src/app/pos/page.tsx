"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { ShoppingCart, Wallet, Trash2, Package, Search, Plus, Minus } from "lucide-react";

export default function POSPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false); // Mencegah double klik bayar

    // Ambil data produk dari API
    const fetchProducts = () => {
        axios.get("/api/products")
            .then(res => {
                // Antisipasi jika Laravel membungkus data di dalam object 'data'
                const data = Array.isArray(res.data) ? res.data : res.data.data || [];
                setProducts(data);
            })
            .catch(err => console.error("Gagal mengambil produk:", err));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Filter pencarian produk
    const filteredProducts = products.filter((product: any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Fungsi Tambah ke Keranjang
    const addToCart = (product: any) => {
        const maxStock = Number(product.stock); // Paksa jadi angka
        const exist = cart.find(item => item.id === product.id);
        const currentQtyInCart = exist ? exist.quantity : 0;

        if (currentQtyInCart + 1 > maxStock) {
            alert(`Maaf, stok ${product.name} tidak mencukupi!`);
            return;
        }

        if (exist) {
            setCart(cart.map(item => 
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {    
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    // Fungsi Mengubah Jumlah (Tambah / Kurang) di dalam Keranjang
    const updateQuantity = (productId: any, amount: number) => {
        setCart(cart.map(item => {
            if (item.id === productId) {
                const newQty = item.quantity + amount;
                const maxStock = Number(item.stock);

                if (newQty > maxStock) {
                    alert(`Stok produk tidak mencukupi!`);
                    return item;
                }
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean)); // Menghapus item jika quantity menjadi 0
    };

    // Fungsi Hapus Item dari Keranjang
    const removeFromCart = (productId: any) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    // Hitung Total Belanjaan
    const totalPrice = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

// Fungsi Bayar / Kirim ke Laravel
    const handleCheckout = async () => {
        if (cart.length === 0 || isSubmitting) return;
        setIsSubmitting(true);

        try {
            // UBAH BAGIAN INI: Ganti product_id menjadi id agar sesuai keinginan Laravel
            const payload = {
                total_price: totalPrice,
                items: cart.map(item => ({
                    id: item.id, // <-- Cukup ganti bagian ini dari product_id menjadi id
                    quantity: item.quantity,
                    price: Number(item.price)
                }))
            };

            await axios.post("/api/transactions", payload);
            alert("Pembayaran Berhasil!");
            setCart([]);
            fetchProducts(); // Segarkan stok produk terbaru dari database
        } catch (err: any) {
            console.error("Detail Eror Transaksi:", err.response?.data);
            alert("Gagal memproses transaksi: " + (err.response?.data?.message || "Periksa koneksi/API"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
            
            {/* SISI KIRI: DAFTAR PRODUK */}
            <div className="flex-1 p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Package className="text-blue-500"/> Menu Kasir
                </h1>

                {/* SEARCH BAR */}
                <div className="mb-6 sticky top-0 bg-gray-950 z-10 py-2">
                    <div className="relative group">
                        <Search className="absolute left-4 top-3 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Cari nama produk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {/* GRID PRODUK */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((p: any) => {
                            const isOutOfStock = Number(p.stock) <= 0;
                            return (
                                <button 
                                    key={p.id} 
                                    disabled={isOutOfStock}
                                    onClick={() => addToCart(p)}
                                    className={`p-4 rounded-2xl border transition shadow-lg text-left flex flex-col justify-between h-36 ${
                                        isOutOfStock 
                                        ? "bg-gray-950 border-gray-900 opacity-40 cursor-not-allowed" 
                                        : "bg-gray-900 border-gray-800 hover:border-blue-500"
                                    }`}
                                >
                                    <div>
                                        <h3 className="font-bold truncate text-gray-100">{p.name}</h3>
                                        <p className="text-blue-400 font-mono text-sm mt-1">Rp {Number(p.price).toLocaleString()}</p>
                                    </div>
                                    <div className={`text-[11px] font-medium ${isOutOfStock ? "text-red-500 font-bold" : "text-gray-500"}`}>
                                        {isOutOfStock ? "STOK HABIS" : `Stok: ${p.stock}`}
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center flex flex-col items-center">
                            <Search size={48} className="text-gray-800 mb-4" />
                            <p className="text-gray-500">Produk tidak ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* SISI KANAN: KERANJANG BELANJA */}
            <div className="w-96 bg-gray-900 border-l border-gray-800 p-6 flex flex-col justify-between shadow-2xl h-full">
                <div>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                        <ShoppingCart className="text-blue-500" size={22}/> Keranjang
                    </h2>

                    {/* DAFTAR ITEM DI KERANJANG */}
                    <div className="space-y-4 overflow-y-auto max-h-[55vh] pr-1">
                        {cart.length > 0 ? (
                            cart.map((item) => (
                                <div key={item.id} className="flex items-center justify-between bg-gray-950 p-3 rounded-xl border border-gray-800">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h4 className="font-semibold text-sm truncate text-gray-200">{item.name}</h4>
                                        <p className="text-xs text-blue-400 font-mono mt-0.5">Rp {(Number(item.price) * item.quantity).toLocaleString()}</p>
                                    </div>
                                    
                                    {/* CONTROLLER JUMLAH QUANTITY */}
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300">
                                            <Minus size={14} />
                                        </button>
                                        <span className="font-mono text-sm w-6 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300">
                                            <Plus size={14} />
                                        </button>
                                        <button onClick={() => removeFromCart(item.id)} className="p-1 ml-1 text-red-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-600 py-10 text-sm">Keranjang masih kosong.</p>
                        )}
                    </div>
                </div>

                {/* TOTAL HARGA DAN TOMBOL CHECKOUT */}
                <div className="border-t border-gray-800 pt-4 bg-gray-900">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400 text-sm">Total Tagihan:</span>
                        <span className="text-2xl font-bold font-mono text-blue-400">Rp {totalPrice.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                            cart.length === 0 || isSubmitting
                            ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    >
                        <Wallet size={18} /> {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
                    </button>
                </div>

            </div>
        </div>
    );
}