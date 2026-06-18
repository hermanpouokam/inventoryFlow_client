"use client";

import { useState, useEffect, useCallback } from "react";
import SecureLS from "secure-ls";
import { instance } from "@/lib/api";
import type { UserType } from "@/lib/types";

let ls: SecureLS | null = null;
if (typeof window !== "undefined") {
    ls = new SecureLS({
        encodingType: "aes",
        encryptionSecret: "interact-app",
    });
}

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
}

export interface User {
    id: number;
    email: string;
    name: string;
    surname?: string;
    user_type: UserType;
    sales_point?: {
        id: number;
        name: string;
    } | null;
    enterprise?: {
        id: number;
        name: string;
    };
}

interface LoginCredentials {
    email: string;
    password: string;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
    });

    useEffect(() => {
        if (typeof window === "undefined" || !ls) return;
        const token = ls.get("accessToken");
        if (token) {
            instance
                .get<User>("/current-user/")
                .then(({ data }) =>
                    setState({ isAuthenticated: true, isLoading: false, user: data })
                )
                .catch(async () => {
                    ls?.remove("accessToken");
                    ls?.remove("refreshToken");
                    ls?.remove("userData");
                    await fetch("/api/logout");
                    setState({ isAuthenticated: false, isLoading: false, user: null });
                });
        } else {
            setState((s) => ({ ...s, isLoading: false }));
        }
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        const { data } = await instance.post<{
            access: string;
            refresh: string;
            user: User;
        }>("/token/", credentials);

        if (ls) {
            ls.set("accessToken", data.access);
            ls.set("refreshToken", data.refresh);
        }

        setState({ isAuthenticated: true, isLoading: false, user: data.user });
        return data;
    }, []);

    const logout = useCallback(() => {
        if (ls) {
            ls.remove("accessToken");
            ls.remove("refreshToken");
        }
        setState({ isAuthenticated: false, isLoading: false, user: null });
    }, []);

    return { ...state, login, logout };
}