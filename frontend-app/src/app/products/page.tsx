"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Trash2, Plus, X, PackageOpen, Pencil, ChevronLeft, ChevronRight, SlidersHorizontal, Search } from "lucide-react";

export default function ProductPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    
    // State untuk Form
    const [formData, setFormData] = useState({ name: "", category_id: "", price: "", stock: "" });
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentProductId, setCurrentProductId] = useState<number | null>(null);

    // 🌟 STATE FILTER, SORT, PAGINATION & SEARCH
    const [searchQuery, setSearchQuery] = useState(""); // State baru untuk pencarian
    const [filterCategory, setFilterCategory] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get("/api/products");
            const data = Array.isArray(res.data) ? res.data : res.data.data || [];
            setProducts(data);
        } catch (err) {
            console.error("Gagal mengambil data produk", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get("/api/categories");
            const data = Array.isArray(res.data) ? res.data : res.data.data || [];
            setCategories(data);
        } catch (err) {
            console.error("Gagal mengambil data kategori", err);
        }
    };

    // 🌟 PROSES FILTERING, SORTING & SEARCHING DATA
    const getProcessedProducts = () => {
        let result = [...products];

        // 1. Filter Berdasarkan Pencarian Nama (Search Bar)
        if (searchQuery) {
            result = result.filter((p: any) => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Filter Kategori
        if (filterCategory) {
            result = result.filter((p: any) => String(p.category_id) === filterCategory);
        }

        // 3. Sorting Data
        if (sortBy === "alpha-asc") {
            result.sort((a: any, b: any) => a.name.localeCompare(b.name));
        } else if (sortBy === "alpha-desc") {
            result.sort((a: any, b: any) => b.name.localeCompare(a.name));
        } else if (sortBy === "price-desc") {
            result.sort((a: any, b: any) => Number(b.price) - Number(a.price));
        } else if (sortBy === "price-asc") {
            result.sort((a: any, b: any) => Number(a.price) - Number(b.price));
        } else if (sortBy === "stock-desc") {
            result.sort((a: any, b: any) => Number(b.stock) - Number(a.stock));
        } else if (sortBy === "stock-asc") {
            result.sort((a: any, b: any) => Number(a.stock) - Number(b.stock));
        }

        return result;
    };

    const processedProducts = getProcessedProducts();

    // PERHITUNGAN PAGINATION (10 Data per Halaman)
    const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = processedProducts.slice(indexOfFirstItem, indexOfLastItem);

    // Handler jika ada perubahan input saringan (Reset ke halaman 1)
    const handleSearchChange = (e: any) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (e: any) => {
        setFilterCategory(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e: any) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    // Handler Form Tambah/Edit & Hapus
    const openEditModal = (product: any) => {
        setIsEditMode(true);
        setCurrentProductId(product.id);
        setFormData({
            name: product.name,
            category_id: product.category_id || "",
            price: product.price.toString(),
            stock: product.stock.toString()
        });
        setShowModal(true);
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setCurrentProductId(null);
        setFormData({ name: "", category_id: "", price: "", stock: "" });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                category_id: Number(formData.category_id),
                price: Number(formData.price),
                stock: Number(formData.stock)
            };

            if (isEditMode && currentProductId) {
                await axios.post(`/api/products/${currentProductId}`, { ...payload, _method: 'PUT' });
                alert("Produk berhasil diperbarui!");
            } else {
                await axios.post("/api/products", payload);
                alert("Produk berhasil ditambahkan!");
            }
            closeModal();
            fetchProducts();
        } catch (err) {
            alert("Gagal memproses produk");
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditMode(false);
        setCurrentProductId(null);
        setFormData({ name: "", category_id: "", price: "", stock: "" });
    };

    const handleAddCategory = async () => {
        if (!newCategory) return;
        try {
            await axios.post("/api/categories", { name: newCategory });
            setNewCategory(""); 
            fetchCategories(); 
            alert("Kategori berhasil ditambah!");
        } catch (err) {
            alert("Gagal menambah kategori");
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
        try {
            await axios.post(`/api/products/${id}`, { _method: 'DELETE' });
            fetchProducts(); 
            alert("Produk berhasil dihapus!");
        } catch (err) {
            alert("Gagal menghapus produk.");
        }
    };

    return (
        <div className="p-8 bg-gray-950 min-h-screen text-white">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Manajemen Produk</h1>
                <button 
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={18} /> Tambah Produk
                </button>
            </div>

            {/* 🌟 COCOK DENGAN REVISI: BAR SEARCH, FILTER & SORTING */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-gray-900 p-4 rounded-xl border border-gray-800 items-center justify-between shadow-md">
                
                {/* Bagian Kiri: Search Bar */}
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Cari nama produk di manajemen..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    />
                </div>
                
                {/* Bagian Kanan: Filter Dropdown */}
                <div className="flex flex-wrap gap-4 w-full lg:w-auto items-center justify-end">
                    <div className="hidden sm:flex items-center gap-1.5 text-gray-400 text-xs">
                        <SlidersHorizontal size={14} className="text-blue-500" />
                        <span>Filter:</span>
                    </div>

                    {/* Filter Kategori */}
                    <select 
                        value={filterCategory}
                        onChange={handleFilterChange}
                        className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500 transition w-full sm:w-44"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {/* Sorting Aturan */}
                    <select 
                        value={sortBy}
                        onChange={handleSortChange}
                        className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500 transition w-full sm:w-52"
                    >
                        <option value="default">Urutkan: Default</option>
                        <option value="alpha-asc">Nama: A ke Z</option>
                        <option value="alpha-desc">Nama: Z ke A</option>
                        <option value="price-desc">Harga: Paling Mahal</option>
                        <option value="price-asc">Harga: Paling Murah</option>
                        <option value="stock-desc">Stok: Terbanyak</option>
                        <option value="stock-asc">Stok: Tersedikit</option>
                    </select>
                </div>
            </div>

            {/* TABEL PRODUK */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl mb-4">
                {currentItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400 text-sm">
                                    <th className="p-4 w-16 text-center">No</th>
                                    <th className="p-4">Nama Produk</th>
                                    <th className="p-4">Kategori</th>
                                    <th className="p-4">Harga</th>
                                    <th className="p-4 w-32 text-center">Stok</th>
                                    <th className="p-4 w-28 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-sm">
                                {currentItems.map((product: any, index: number) => (
                                    <tr key={product.id} className="hover:bg-gray-800/40 transition">
                                        <td className="p-4 text-center text-gray-500 font-mono">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="p-4 font-semibold text-gray-200">{product.name}</td>
                                        <td className="p-4">
                                            <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md text-xs border border-gray-700">
                                                {product.category?.name || "Tanpa Kategori"}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-blue-400">
                                            Rp {Number(product.price).toLocaleString("id-ID")}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`font-mono px-2 py-0.5 rounded text-xs font-bold ${
                                                Number(product.stock) <= 0 ? "bg-red-950 text-red-400 border border-red-900" : "text-gray-300"
                                            }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => openEditModal(product)} className="p-2 text-amber-400 hover:text-amber-500 hover:bg-amber-950/40 rounded-lg transition">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-950/40 rounded-lg transition">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-24 text-center flex flex-col items-center justify-center">
                        <PackageOpen size={56} className="text-gray-700 mb-4" />
                        <h3 className="text-gray-400 font-medium">Data Tidak Ditemukan</h3>
                        <p className="text-gray-600 text-xs mt-1">Tidak ada produk dengan nama atau filter tersebut.</p>
                    </div>
                )}
            </div>

            {/* PANEL PAGINATION KONTROL */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-gray-900 border border-gray-800 px-4 py-3 rounded-xl shadow-lg">
                    <div className="text-xs text-gray-400">
                        Menampilkan <span className="font-semibold text-white">{indexOfFirstItem + 1}</span> sampai{" "}
                        <span className="font-semibold text-white">
                            {indexOfLastItem > processedProducts.length ? processedProducts.length : indexOfLastItem}
                        </span>{" "}
                        dari <span className="font-semibold text-white">{processedProducts.length}</span> produk
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-800 bg-gray-950 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-mono px-3 text-gray-300">
                            Halaman {currentPage} dari {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-800 bg-gray-950 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL FORM TAMBAH / EDIT */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between mb-4 items-center">
                            <h2 className="text-xl font-bold">{isEditMode ? "Edit Detail Produk" : "Tambah Produk Baru"}</h2>
                            <button className="text-gray-400 hover:text-white" onClick={closeModal}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Nama Produk</label>
                                <input type="text" placeholder="Contoh: Kopi Susu" value={formData.name} className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white focus:outline-none focus:border-blue-500" onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            {!isEditMode && (
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Buat Kategori Baru (Opsional)</label>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Nama kategori baru..." className="flex-1 bg-gray-800 border border-gray-700 p-2 rounded text-sm text-white focus:outline-none focus:border-blue-500" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                                        <button type="button" onClick={handleAddCategory} className="bg-emerald-600 px-4 rounded text-sm font-semibold hover:bg-emerald-700 transition">Tambah</button>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Pilih Kategori</label>
                                <select className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white focus:outline-none focus:border-blue-500" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Harga (Rp)</label>
                                    <input type="number" placeholder="0" value={formData.price} className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white focus:outline-none focus:border-blue-500" onChange={e => setFormData({...formData, price: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Stok</label>
                                    <input type="number" placeholder="0" value={formData.stock} className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white focus:outline-none focus:border-blue-500" onChange={e => setFormData({...formData, stock: e.target.value})} required />
                                </div>
                            </div>
                            <button className={`w-full py-3 rounded-xl font-bold transition mt-2 text-white ${isEditMode ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                                {isEditMode ? "Simpan Perubahan" : "Simpan Produk"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}