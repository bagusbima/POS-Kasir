"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { FileText, Calendar, ChevronDown, Tag, ArrowLeft, Printer, Search } from "lucide-react";
import Link from "next/link";

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState([]);
    const [openId, setOpenId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState("");

    useEffect(() => {
        axios.get("/api/transactions").then(res => setTransactions(res.data));
    }, []);

    // 1. Logika Grouping Transaksi per Tanggal
    const groupedTransactions = transactions.reduce((groups: any, transaction: any) => {
        const dateKey = new Date(transaction.created_at).toISOString().split('T')[0]; // Format YYYY-MM-DD untuk ID
        const dateDisplay = new Date(transaction.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        if (!groups[dateKey]) {
            groups[dateKey] = { display: dateDisplay, items: [] };
        }
        groups[dateKey].items.push(transaction);
        return groups;
    }, {});

    // 2. Fungsi Navigasi (Scroll ke Tanggal)
    const scrollToDate = (dateId: string) => {
        const element = document.getElementById(dateId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setSelectedDate(dateId);
        }
    };

    const toggleDetail = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="p-8 bg-gray-950 min-h-screen text-white">
            <div className="max-w-4xl mx-auto">
                
                {/* HEADER & NAVIGASI */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Link href="/dashboard" className="text-blue-400 flex items-center gap-2 mb-2 text-sm hover:underline">
                            <ArrowLeft size={16} /> Kembali ke Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold italic tracking-tighter">Riwayat Penjualan</h1>
                        <p className="text-gray-500 text-sm">Laporan transaksi harian real-time.</p>
                    </div>

                    {/* INPUT NAVIGASI TANGGAL */}
                    <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex items-center gap-4 shadow-xl">
                        <div className="flex flex-col">
                            <label className="text-[10px] uppercase text-gray-500 font-bold mb-1">Loncat ke Tanggal</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="date" 
                                    value={selectedDate}
                                    onChange={(e) => scrollToDate(e.target.value)}
                                    className="bg-gray-800 border-none rounded-lg text-sm p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                    <Search size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LIST TRANSAKSI */}
                <div className="space-y-12">
                    {Object.keys(groupedTransactions).sort().reverse().map((dateKey) => {
                        const group = groupedTransactions[dateKey];
                        const dailyTotal = group.items.reduce((sum: number, t: any) => sum + t.total_price, 0);

                        return (
                            <div key={dateKey} id={dateKey} className="scroll-mt-32">
                                {/* HEADER TANGGAL */}
                                <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-gray-950/90 backdrop-blur-md py-4 border-b border-gray-900">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                                        <h2 className="text-xl font-bold">{group.display}</h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Total Hari Ini</p>
                                        <p className="text-lg font-black text-emerald-400">Rp {dailyTotal.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* LIST KARTU TRANSAKSI */}
                                <div className="space-y-3">
                                    {group.items.map((t: any) => (
                                        <div key={t.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all">
                                            <button 
                                                onClick={() => toggleDetail(t.id)}
                                                className="w-full p-5 flex justify-between items-center text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-gray-800 p-3 rounded-xl text-gray-400">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-mono text-blue-500">TRX-ID #{t.id}</p>
                                                        <p className="font-bold">
                                                            Jam {new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-xl font-black font-mono">Rp {t.total_price.toLocaleString()}</p>
                                            </button>

                                            {/* DETAIL PRODUK */}
                                            {openId === t.id && (
                                                <div className="p-6 bg-black/20 border-t border-gray-800 animate-in fade-in duration-300">
                                                    <div className="space-y-4">
                                                        {t.details.map((d: any) => (
                                                            <div key={d.id} className="flex justify-between items-center text-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <Tag size={14} className="text-gray-600" />
                                                                    <span>{d.product?.name} <span className="text-gray-500 text-xs">x{d.quantity}</span></span>
                                                                </div>
                                                                <span className="font-mono">Rp {d.subtotal.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                        <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                                                            <button onClick={() => window.print()} className="text-[10px] font-bold text-gray-500 flex items-center gap-2 hover:text-white">
                                                                <Printer size={14} /> PRINT STRUK
                                                            </button>
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-gray-500 uppercase">Total Bayar</p>
                                                                <p className="font-bold text-blue-400">Rp {t.total_price.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}