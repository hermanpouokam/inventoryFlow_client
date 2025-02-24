'use client'

import axios from "axios";
import { Children, createContext, useContext, useState } from "react";

enum Role {

}

interface AuthProps {
    authState: {
        authenticated: boolean | null | undefined;
        username: string | null;
        id: string | null;
        role: Role | null;
        email: string | null;
    };
    onLogin: (username: string, password: string) => void;
    registerUser: (username: string, password: string) => void;
    onLogout: () => void;
}

const AuthContext = createContext<AuthProps>({})

export const AuthProvider = ({ Children }: any) => {


    const [authState, setAuthState] = useState<{
        authenticated: boolean | null | undefined;
        username: string | null;
        role: Role | null;
        email: string | null;
        id: number | null;
    }>({
        authenticated: undefined,
        username: null,
        role: null,
        email: null,
        id: null
    });
    const instance = axios.create({
        baseURL: 'http://127.0.0.1:8000/api',
    })

    instance.defaults.timeout = 2500;

    const registerUser = (name: any, surname: any, email: any, password: any, number: any) => {
        return instance.post(`/register-user/`, {
            name,
            surname,
            email,
            password,
        });
    }

    const values = {
        registerUser
    }

    return <AuthContext.Provider value={values}></AuthContext.Provider>

}

export const useAuth = (): AuthProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context
}