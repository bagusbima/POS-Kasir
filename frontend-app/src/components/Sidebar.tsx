"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // 🌟 TAMBAHKAN useRouter
import { useAuth } from '@/hooks/useAuth';
import axios from "@/lib/axios"; // 🌟 TAMBAHKAN AXIOS
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    History, 
    LogOut,
    Store
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter(); // 🌟 INISIALISASI ROUTER
    const { logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Kasir (POS)', href: '/pos', icon: <ShoppingCart size={20} /> },
        { name: 'Produk', href: '/products', icon: <Package size={20} /> },
        { name: 'Riwayat', href: '/transactions', icon: <History size={20} /> },
    ];

    // 🌟 FUNGSI LOGOUT BARU
    const handleLogout = async () => {
        if (!confirm("Apakah Anda yakin ingin keluar dari GUSBIM POS?")) return;

        try {
            // Panggil fungsi logout bawaan hook. 
            // Biasanya hook ini sudah otomatis menembak API Laravel & menghapus token di browser
            await logout(); 
        } catch (err) {
            console.error("Gagal logout melalui hook:", err);
        } finally {
            // Jaga-jaga bersihkan sisa token dan lempar ke login
            localStorage.removeItem("token");
            alert("Anda telah berhasil logout.");
            router.push("/login");
        }
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6 z-50">
            {/* Logo / Nama Toko */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                    <Store size={24} />
                </div>
                <h2 className="text-xl font-bold tracking-tighter text-white">GUSBIM POS</h2>
            </div>

            {/* Menu Navigasi */}
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.name} 
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                isActive 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout - Bagian Bawah */}
            <div className="pt-6 border-t border-gray-800">
                {/* 🌟 PASANG EVENT onClick={handleLogout} DI SINI */}
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Keluar</span>
                </button>
            </div>
        </aside>
    );
}