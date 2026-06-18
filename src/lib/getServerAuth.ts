import { cookies } from "next/headers";
import API_URL from "@/config";

const LONG_LIFE_DURATION = 10 * 365 * 24 * 60 * 60;

async function refreshAccessToken(refreshToken: string) {
    try {
        const response = await fetch(`${API_URL}/token/refresh/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        return data.access_token;
    } catch (error) {
        console.error("Refresh token error:", error);
        return null;
    }
}

export async function getServerAuth() {
    try {
        const cookieStore = await cookies();

        let accessToken = cookieStore.get("access_token")?.value;
        const refreshToken = cookieStore.get("refresh_token")?.value;

        if (!accessToken) {
            return null;
        }

        // Verify token + get current user
        let response = await fetch(`${API_URL}/current-user/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        // Token expired -> refresh
        if (!response.ok && refreshToken) {
            const newAccessToken = await refreshAccessToken(refreshToken);

            if (!newAccessToken) {
                return null;
            }

            accessToken = newAccessToken;

            // Save new token
            cookieStore.set("access_token", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: LONG_LIFE_DURATION,
            });

            // Retry request
            response = await fetch(`${API_URL}/current-user/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${newAccessToken}`,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            });
        }

        if (!response.ok) {
            return null;
        }

        const user = await response.json() as User ;

        return {
            user,
            accessToken,
        };
    } catch (error) {
        console.error("Server auth error:", error);
        return null;
    }
}