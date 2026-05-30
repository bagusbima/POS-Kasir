import axios from 'axios';

const instance = axios.create({
    // 🌟 Menggunakan Environment Variable untuk Production, dan fallback ke localhost saat coding di lokal
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    
    // denganCredentials wajib true agar cookie laravel_session & XSRF-TOKEN disimpan browser
    withCredentials: true, 
    
    // withXSRFToken wajib true di Axios versi terbaru agar token dikirim balik ke Laravel
    withXSRFToken: true,   
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

export default instance;