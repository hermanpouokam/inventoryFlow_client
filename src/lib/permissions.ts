// lib/auth.ts
import { cookies } from "next/headers";
import { sanitizePermissions } from "@/constants/permissions";
import API_URL from "@/config";

export async function getUserWithPermissions(): Promise<User | null> {
    const cookie = cookies().get("access_token")?.value;
    if (!cookie) return null;

    const res = await fetch(`${API_URL}/current-user/`, {
        headers: { Authorization: `Bearer ${cookie}` },
        cache: "no-store",
    });

    const data = await res.json();

    const safePerms = sanitizePermissions(data ? data?.action_permissions?.map((el: ActionPermission) => el.name) : []);
    return { ...data, action_permissions: safePerms };
}