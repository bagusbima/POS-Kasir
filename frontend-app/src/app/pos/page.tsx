"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { ShoppingCart, Wallet, Trash2, Package, Search } from "lucide-react";

export default function POSPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");


    const filteredProducts = products.filter((product:any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        axios.get("/api/products").then(res => setProducts(res.data));
    }, []);

    const addToCart = (product: any) => {
        const exist = cart.find(item => item.id === product.id);
        const currentQtyInCart = exist ? exist.quantity : 0;

        // CEK: Apakah jumlah di keranjang + 1 melebihi stok asli?
        if (currentQtyInCart + 1 > product.stock) {
            alert(`Maaf, stok ${product.name} tidak cukup!`);
            return;
        }

        if (exist) {
            setCart(cart.map(item => 
                item.id === product.id ? { ...exist, quantity: exist.quantity + 1 } : item
            ));
        } else {    
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            await axios.post("/api/transactions", { total_price: totalPrice, items: cart });
            alert("Pembayaran Berhasil!");
            setCart([]);
            // Refresh stok produk
            axios.get("/api/products").then(res => setProducts(res.data));
        } catch (err) {
            alert("Gagal memproses transaksi");
        }
    };

    return (
        <div className="flex h-screen bg-gray-950 text-white">
            {/* SISI KIRI: PRODUK */}
            <div className="flex-1 p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Package className="text-blue-500"/> Menu Kasir
                </h1>

                {/* SEARCH BAR */}
                <div className="mb-6 sticky top-0 bg-gray-950 z-10 py-2">
                    <div className="relative group">
                        <Search className="absolute left-4 top-3 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Cari nama produk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {/* DAFTAR PRODUK (Gunakan filteredProducts di sini) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((p: any) => (
                            <button 
                                key={p.id} 
                                disabled={p.stock <= 0}
                                onClick={() => addToCart(p)}
                                className={`p-4 rounded-2xl border transition shadow-lg text-left ${
                                    p.stock <= 0 
                                    ? "bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed" 
                                    : "bg-gray-900 border-gray-800 hover:border-blue-500"
                                }`}
                            >
                                <h3 className="font-bold truncate">{p.name}</h3>
                                <p className="text-blue-400 font-mono text-sm">Rp {p.price.toLocaleString()}</p>
                                <div className={`mt-2 text-[10px] ${p.stock <= 0 ? "text-red-500 font-bold" : "text-gray-500"}`}>
                                    {p.stock <= 0 ? "STOK HABIS" : `Stok: ${p.stock}`}
                                </div>
                            </button>
                        ))
                    ) : (
                        /* Tampilan Jika Tidak Ditemukan */
                        <div className="col-span-full py-20 text-center flex flex-col items-center">
                            <Search size={48} className="text-gray-800 mb-4" />
                            <p className="text-gray-500">Produk "<span className="text-white">{searchQuery}</span>" tidak ditemukan.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* SISI KANAN: KERANJANG (Sama seperti kodemu) */}
            <div className="w-96 bg-gray-900 border-l border-gray-800 p-6 flex flex-col shadow-2xl">
                {/* ... konten keranjang ... */}
            </div>
        </div>
    );
}