'use client'
import { instance } from "@/components/fetch";


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