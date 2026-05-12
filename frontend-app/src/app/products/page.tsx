"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Trash2, Plus, X } from "lucide-react";

export default function ProductPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    
    // State untuk Form
    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        price: "",
        stock: ""
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        const res = await axios.get("/api/products");
        setProducts(res.data);
    };

    const fetchCategories = async () => {
        const res = await axios.get("/api/categories"); // Kita buat di backend setelah ini
        setCategories(res.data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post("/api/products", formData);
            setShowModal(false);
            setFormData({ name: "", category_id: "", price: "", stock: "" });
            fetchProducts();
        } catch (err) {
            alert("Gagal menambah produk");
        }
    };
    const handleAddCategory = async () => {
    if (!newCategory) return;
    try {
        await axios.post("/api/categories", { name: newCategory });
        setNewCategory(""); // Kosongkan input
        fetchCategories(); // Refresh list kategori di dropdown
        alert("Kategori berhasil ditambah!");
    } catch (err) {
        alert("Gagal menambah kategori");
    }
    };

    return (
        <div className="p-8 bg-gray-950 min-h-screen text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Manajemen Produk</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} /> Tambah Produk
                </button>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-md">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl font-bold">Tambah Produk Baru</h2>
                            <button onClick={() => setShowModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                type="text" placeholder="Nama Produk" 
                                className="w-full bg-gray-800 p-2 rounded"
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                            <div className="flex gap-2 mb-2">
                                <input 
                                    type="text" 
                                    placeholder="Kategori Baru..." 
                                    className="flex-1 bg-gray-800 p-2 rounded text-sm"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                />
                                <button 
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="bg-emerald-600 px-3 rounded text-sm hover:bg-emerald-700"
                                >
                                    Tambah
                                </button>
                            </div>
                            <select 
                                className="w-full bg-gray-800 p-2 rounded text-white"
                                onChange={e => setFormData({...formData, category_id: e.target.value})}
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <input 
                                type="number" placeholder="Harga" 
                                className="w-full bg-gray-800 p-2 rounded"
                                onChange={e => setFormData({...formData, price: e.target.value})}
                            />
                            <input 
                                type="number" placeholder="Stok" 
                                className="w-full bg-gray-800 p-2 rounded"
                                onChange={e => setFormData({...formData, stock: e.target.value})}
                            />
                            <button className="w-full bg-blue-600 py-2 rounded font-bold">Simpan Produk</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabel Produk tetap sama di bawah... */}
        </div>
    );
}