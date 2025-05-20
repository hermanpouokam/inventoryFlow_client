import { NextResponse } from "next/server";
import API_URL from "@/config";
export const LONG_LIFE_DURATION = 10 * 365 * 24 * 60 * 60;

// 🔄 Fonction pour rafraîchir le token
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
console.log('AP', AP)
    // ❌ Pas de token => Redirection vers /signin
    if (!token) {
        console.log("❌ Pas de token, redirection vers /signin");
        const signInUrl = new URL("/signin", req.url);
        if (pathname === ("/signin") || pathname === ("/signup")) {
            console.log("🔄 Utilisateur connecté, redirection vers /dashboard");
            return NextResponse.next();
        }

    }

    // ✅ Vérification du token
    try {
        const response = await fetch(`${API_URL}/verify-token/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        if (response.ok) {
            console.log("✅ Token valide");
            if (pathname === ("/signin") || pathname === ("/signup")) {
                console.log("🔄 Utilisateur connecté, redirection vers /dashboard");
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }

            return null; // ⬅️ Laisse passer pour appeler `enterpriseMiddleware`
        } else {
            // 🔄 Tentative de rafraîchissement du token
            if (refresh_token) {
                const newToken = await refreshToken(refresh_token);
                if (newToken) {
                    console.log("🔄 Token rafraîchi");
                    const nextResponse = NextResponse.next();
                    nextResponse.cookies.set("access_token", newToken, {
                        maxAge: LONG_LIFE_DURATION,
                        path: "/",
                    });
                    return nextResponse;
                }
            }
            console.log("❌ Token invalide, redirection vers /signin");
            if (pathname === ("/signin") || pathname === ("/signup")) {
                console.log("🔄 Utilisateur connecté, redirection vers /dashboard");
                return NextResponse.next();
            }
            const signInUrl = new URL("/signin", req.url);
            signInUrl.searchParams.set("next", requestedUrl.pathname);
            return NextResponse.redirect(signInUrl);
        }
    } catch (err) {
        console.error("❌ Erreur lors de la vérification du token:", err.message);
        if (pathname === ("/signin") || pathname === ("/signup")) {
            console.log("🔄 Utilisateur connecté, redirection vers /dashboard");
            return NextResponse.next();
        }
        const signInUrl = new URL("/signin", req.url);
        signInUrl.searchParams.set("next", requestedUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }
}
