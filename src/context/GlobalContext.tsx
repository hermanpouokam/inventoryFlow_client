"use client";
import { instance } from "@/components/fetch";
import React, { createContext, useContext, useState, ReactNode } from "react";

type AppContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    theme: "light" | "dark";
    setTheme: (theme: "light" | "dark") => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {

    const [user, setUser] = useState<User | null>(null);
    const [theme, setTheme] = useState<"light" | "dark">("light");

    const getUser = async () => {
        const res = await instance.get(`current-user`, { withCredentials: true })
        setUser(res.data)
    }
    React.useEffect(() => {
        getUser()
    }, []);

    return (
        <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
