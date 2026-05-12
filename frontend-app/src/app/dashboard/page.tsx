"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DollarSign, Package, ShoppingCart, TrendingUp, ArrowRight } from "lucide-react";
import Link from 'next/link';

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]); // Tambahkan state untuk transaksi

    useEffect(() => {
        // Ambil data statistik dashboard
        axios.get("/api/dashboard-stats").then((res) => setData(res.data));
        
        // Ambil data transaksi untuk menghitung produk terlaris
        axios.get("/api/transactions").then((res) => setTransactions(res.data));
    }, []);

    // Logika menghitung barang terlaris (Sekarang aman karena 'transactions' sudah ada)
    const productSales = transactions.reduce((acc: any, t: any) => {
        t.details?.forEach((d: any) => {
            const name = d.product?.name || "Unknown";
            acc[name] = (acc[name] || 0) + d.quantity;
        });
        return acc;
    }, {});

    const topProducts = Object.entries(productSales)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 3);

    if (!data) return <div className="p-10 text-white animate-pulse">Memuat Data Visualisasi...</div>;

    return (
        <div className="p-8 bg-gray-950 min-h-screen text-white">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ringkasan Penjualan</h1>
                    <p className="text-gray-400">Statistik performa toko kamu hari ini.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/transactions" className="text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
                        Riwayat Transaksi
                    </Link>
                    <Link href="/products" className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-700 transition">
                        Kelola Produk
                    </Link>
                </div>
            </header>

            {/* Grid Kartu Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                    title="Total Pendapatan"
                    value={`Rp ${data.stats.total_revenue.toLocaleString()}`}
                    icon={<DollarSign className="text-emerald-500" />}
                    desc="+12% dari bulan lalu"
                />
                <StatCard
                    title="Produk Terdaftar"
                    value={data.stats.total_products}
                    icon={<Package className="text-blue-500" />}
                    desc="Stok perlu dipantau"
                />
                <StatCard
                    title="Total Transaksi"
                    value={data.stats.total_transactions}
                    icon={<ShoppingCart className="text-amber-500" />}
                    desc="Transaksi sukses"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bagian Grafik (Lebar 2 Kolom) */}
                <div className="lg:col-span-2 bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp size={20} className="text-blue-400" />
                        <h2 className="text-xl font-semibold">Tren Pendapatan Bulanan</h2>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.chart_data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#1f2937' }}
                                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: '8px' }}
                                />
                                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bagian Produk Terlaris (Lebar 1 Kolom) */}
                <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="p-2 bg-orange-500/10 text-orange-500 rounded-lg text-sm">🔥</span>
                        Produk Terlaris
                    </h3>
                    <div className="space-y-4">
                        {topProducts.length > 0 ? (
                            topProducts.map(([name, qty]: any, index) => (
                                <div key={index} className="flex justify-between items-center p-4 bg-gray-800/30 rounded-2xl border border-gray-800 hover:border-orange-500/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full text-xs font-bold text-gray-400 border border-gray-700">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-gray-200">{name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-blue-400 font-bold block">{qty}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Terjual</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm italic">Belum ada data penjualan.</p>
                        )}
                    </div>
                    
                    <Link href="/transactions" className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-white transition group">
                        Lihat Semua Riwayat <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, desc }: any) {
    return (
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-800 rounded-xl group-hover:bg-blue-500/10 transition-colors">{icon}</div>
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold mt-1">{value}</h3>
                <p className="text-xs text-gray-500 mt-2">{desc}</p>
            </div>
        </div>
    );
}