// lib/auth.ts
import { cookies } from "next/headers";
import { sanitizePermissions } from "@/constants/permissions";
import API_URL from "@/config";
import { sanitizePagePermissions } from "@/constants/pagePermissions";

export async function getUserWithPermissions(): Promise<User | null> {
    const cookie = cookies().get("access_token")?.value;
    if (!cookie) return null;

    const res = await fetch(`${API_URL}/current-user/`, {
        headers: { Authorization: `Bearer ${cookie}` },
        cache: "no-store",
    });

    const data = await res.json();

    const safePerms = sanitizePermissions(data ? data?.action_permissions?.map((el: ActionPermission) => el.name) : []);
    const safePagePerms = sanitizePagePermissions(data ? data?.permissions?.map((el: Permission) => el.path) : []);
    return { ...data, action_permissions: safePerms, permissions: safePagePerms };
}