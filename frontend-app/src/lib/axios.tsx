import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8000',
    // withCredentials wajib true agar cookie laravel_session & XSRF-TOKEN disimpan browser
    withCredentials: true, 
    // withXSRFToken wajib true di Axios versi terbaru agar token dikirim balik ke Laravel
    withXSRFToken: true,   
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

export default instance;