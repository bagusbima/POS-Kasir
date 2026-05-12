import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
    const router = useRouter();
    
    const login = async (data:any) => {
        try {
            await axios.get('/sanctum/csrf-cookie');

            await axios.post('/login', data, {
                headers: {
                    'Accept ': 'application/json',
                },
            });

            router.push('/dashboard');
        } catch (error:any) {
            console.log(error.response?.data); 
            alert('Login gagal! ' + (error.response?.data?.message || ''));
        }
    };
    const logout = async () => {
        await axios.post('/logout');        
        router.push('/login');
    };

    return { login, logout };
};

