import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
    const router = useRouter();
    
    const login = async ({ email, password }: { email: string; password: string }) => {
    try {
        // Tembak API login biasa (tanpa perlu memanggil /sanctum/csrf-cookie terlebih dahulu)
        const response = await axios.post('/api/login', { email, password });
        
        // Sesuaikan dengan response dari Laravel AuthController yang kita buat kemarin
        const token = response.data.token;
        const user = response.data.user;

        // Simpan token ke localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Arahkan ke dashboard
        router.push('/dashboard');
    } catch (error) {
        console.error("Login gagal:", error);
        alert("Login gagal! Periksa kembali akun Anda.");
    }
    };

    const logout = async () => {
        try {
            await axios.post('/logout');        
        } catch (e) {
            console.error("Logout backend gagal, hapus sesi lokal saja");
        } finally {
            // --- TAMBAHKAN BARIS INI UNTUK HAPUS COOKIE ---
            document.cookie = "is_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            // ----------------------------------------------
            router.push('/login');
        }
    };

    return { login, logout };
};