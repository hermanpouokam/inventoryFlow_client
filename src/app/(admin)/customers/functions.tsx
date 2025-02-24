'use client'
import axios from "axios";
import SecureLS from 'secure-ls';

// Initialize SecureLS
const ls = new SecureLS({ encodingType: 'aes', encryptionSecret: 'interact-app' });

// Create Axios instance
const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    // timeout: 2500,
});

// Request Interceptor
instance.interceptors.request.use(config => {
    const token = ls.get('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

// Response Interceptor
instance.interceptors.response.use(response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = ls.get('refreshToken');
                const response = await instance.post(`/token/refresh/`, {
                    refresh: refreshToken,
                });
                const { access } = response.data;
                ls.set('accessToken', access);
                return instance(originalRequest);
            } catch (err) {
                console.error('Refresh token failed:', err);
                // Redirect to login or notify the user
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export async function getClientCategories() {
    try {
        const response = await instance.get('/client-categories/', { withCredentials: true })
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export async function getClient() {
    try {
        const response = await instance.get('/clients/', { withCredentials: true })
        return response.data
    } catch (error) {
        console.log(error)
    }
}


export const createClientCat = async (name: string, salesPointId: number) => {
    try {
        const response = await instance.post('/client-categories/', {
            name,
            sales_point: salesPointId
        }, { withCredentials: true })
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const createClient = async (data: any) => {
    try {
        const response = await instance.post('/clients/', {
            ...data
        }, { withCredentials: true })
        return response.data
    } catch (error) {
        if (error.response) {
            // Request made and server responded with a status code outside of 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            // Request made but no response received
            console.error('Error request data:', error.request);
        } else {
            // Other errors
            console.error('Error message:', error.message);
        }
        throw error;
    }
}

export default instance