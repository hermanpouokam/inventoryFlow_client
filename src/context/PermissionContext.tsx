"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Permission } from "@/constants/permissions";


type PermissionContextType = {
    hasPermission: (perm: Permission) => boolean;
    setPermissions: (perms: Permission[]) => void;
    user: User | null,
    isAdmin: () => boolean
};

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children,
    initialPermissions = [],
    user
}: {
    children: ReactNode,
    initialPermissions?: Permission[];
    user: User | null
}) => {
    const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);

    const hasPermission = (perm: Permission) => {
        return permissions.includes(perm);
    };
    const isAdmin = () => user?.user_type === 'admin'

    return (
        <PermissionContext.Provider value={{ hasPermission, setPermissions, user, isAdmin }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error("usePermission must be used within a PermissionProvider");
    }
    return context;
};
