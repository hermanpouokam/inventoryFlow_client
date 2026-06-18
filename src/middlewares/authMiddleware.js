import { NextResponse } from "next/server";
import API_URL from "@/config";
export const LONG_LIFE_DURATION = 10 * 365 * 24 * 60 * 60;

// Function to refresh the token
async function refreshToken(refreshToken) {
    try {
        const response = await fetch(`${API_URL}/token/refresh/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.access_token;
        } else {
            throw new Error("Failed to refresh token");
        }
    } catch (error) {
        console.error("Error refreshing token:", error.message);
        return null;
    }
}

export async function authMiddleware(req) {
    const cookies = req.cookies.get("access_token");
    const refresh = req.cookies.get("refresh_token");
    const token = cookies?.value;
    const refresh_token = refresh?.value;
    const requestedUrl = req.nextUrl.clone();
    const pathname = requestedUrl.pathname;

    // If no token, redirect to signin (unless already on signin/signup)
    if (!token) {
        if (pathname === ("/signin") || pathname === ("/signup") || pathname === ('/forgot-password')) {
            return NextResponse.next();
        }
    }

    try {
        // Check token validity
        const response = await fetch(`${API_URL}/verify-token/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        if (response.ok) {
            // Valid token, let it pass
            if (pathname === ("/signin") || pathname === ("/signup") || pathname === ('/forgot-password')) {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }

            return null; // Let pass to call `enterpriseMiddleware`
        } else {
            // Attempt to refresh token (if token invalid or expired and refresh token available)
            if (refresh_token) {
                const newToken = await refreshToken(refresh_token);
                if (newToken) {
                    // Update cookie with new token
                    const nextResponse = NextResponse.next();
                    nextResponse.cookies.set("access_token", newToken, {
                        maxAge: LONG_LIFE_DURATION,
                        path: "/",
                    });
                    return nextResponse; // Let pass to call `enterpriseMiddleware`
                }
            }
            // If refresh fails or no refresh token, redirect to signin
            if (pathname === ("/signin") || pathname === ("/signup")) {
                return NextResponse.next();
            }
            // Redirect to signin with "next" parameter to return to requested page after login
            const signInUrl = new URL("/signin", req.url);
            signInUrl.searchParams.set("next", requestedUrl.pathname);
            return NextResponse.redirect(signInUrl);
        }
    } catch (err) {
        // On error (ex: network), redirect to signin (unless already on signin/signup)
        if (pathname === ("/signin") || pathname === ("/signup")) {
            return NextResponse.next();
        }
        const signInUrl = new URL("/signin", req.url);
        signInUrl.searchParams.set("next", requestedUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }
}

