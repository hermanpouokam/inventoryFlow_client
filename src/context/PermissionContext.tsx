"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Permission } from "@/constants/permissions";
import type { PagePermission } from "@/constants/pagePermissions";


type PermissionContextType = {
    hasPermission: (perm: Permission) => boolean;
    setPermissions: (perms: Permission[]) => void;
    hasPagePermission: (perm: PagePermission) => boolean;
    setPagePermissions: (perm: PagePermission[]) => void;
    user: User | null,
    isAdmin: () => boolean
};

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children,
    initialPermissions = [],
    initialPagePermissions = [],
    user
}: {
    children: ReactNode,
    initialPermissions?: Permission[];
    initialPagePermissions?: PagePermission[],
    user: User | null
}) => {
    const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
    const [pagePermissions, setPagePermissions] = useState<PagePermission[]>(initialPagePermissions);

    const hasPermission = (perm: Permission) => {
        return permissions.includes(perm);
    };
    const hasPagePermission = (pagePerm: PagePermission) => {
        return pagePermissions.includes(pagePerm)
    }
    const isAdmin = () => user?.user_type === 'admin'

    return (
        <PermissionContext.Provider value={{ hasPermission, setPermissions, user, isAdmin, hasPagePermission, setPagePermissions }}>
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
