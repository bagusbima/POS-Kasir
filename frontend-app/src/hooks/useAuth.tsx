import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
    const router = useRouter();
    
    const login = async (data: any) => {
        try {
            await axios.get('/sanctum/csrf-cookie');

            await axios.post('/login', data, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            // WAJIB ADA BARIS INI: Untuk membuat penanda lokal bagi Next.js Middleware
            document.cookie = "is_logged_in=true; path=/; max-age=86400; SameSite=Lax";

            router.push('/dashboard');
        } catch (error: any) {
            console.log(error.response?.data); 
            alert('Login gagal! ' + (error.response?.data?.message || ''));
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