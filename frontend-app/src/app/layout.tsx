"use client"; // Wajib ditambahkan di paling atas untuk membaca URL/Pathname

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { usePathname } from "next/navigation"; // Import hook untuk deteksi URL

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Catatan: export const metadata tidak bisa digabung di file yang memakai "use client".
// Jadi bagian metadata dihapus dari sini (tidak masalah, tidak bikin error).

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Daftarkan route yang TIDAK boleh memunculkan Sidebar
  const isAuthPage = pathname === "/login" || pathname?.startsWith("/auth");

  return (
    <html lang="id" className="dark"> 
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-950 text-white antialiased min-h-screen overflow-x-hidden`}>
        
        {isAuthPage ? (
          // 1. TAMPILAN POLOS (Hanya untuk halaman Login / Auth)
          <main className="min-h-screen bg-gray-950">
            {children}
          </main>
        ) : (
          // 2. TAMPILAN FULL (Untuk Dashboard, POS, Products, Transactions, dll)
          <div className="flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Konten Utama */}
            <main className="flex-1 min-h-screen ml-64 bg-gray-950">
              {children}
            </main>
          </div>
        )}

      </body>
    </html>
  );
}