// import { NextResponse } from "next/server";

// export async function authMiddleware(req) {
//     const token = req.cookies.get("access_token")?.value;
//     const requestedUrl = req.nextUrl.clone();
//     const pathname = requestedUrl.pathname;

//     // ✅ Permettre l'accès à /signin et /signup SANS token
//     if (!token) {
//         if (pathname === "/signin" || pathname === "/signup") {
//             console.log("🔓 Accès autorisé à /signin ou /signup sans token");
//             return NextResponse.next();
//         }
//         console.log("❌ Pas de token, redirection vers /signin");
//         const signInUrl = new URL("/signin", req.url);
//         signInUrl.searchParams.set("next", requestedUrl.pathname);
//         return NextResponse.redirect(signInUrl);
//     }

//     // 🔄 Rediriger un utilisateur connecté depuis /signin et /signup
//     if (token) {
//         try {
//             const response = await fetch("http://127.0.0.1:8000/api/verify-token/", {
//                 method: "POST",
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ token }),
//             });

//             if (response.ok) {
//                 console.log("✅ Token valide");
//                 if (pathname === ("/signin") || pathname === ("/signup")) {
//                     console.log("🔄 Utilisateur connecté, redirection vers /dashboard");
//                     return NextResponse.redirect(new URL("/dashboard", req.url));
//                 }

//                 return NextResponse.next();
//             } else {
//                 // 🔄 Tentative de rafraîchissement du token
//                 if (refresh_token) {
//                     const newToken = await refreshToken(refresh_token);
//                     if (newToken) {
//                         console.log("🔄 Token rafraîchi");
//                         const nextResponse = NextResponse.next();
//                         nextResponse.cookies.set("access_token", newToken, {
//                             maxAge: LONG_LIFE_DURATION,
//                             path: "/",
//                         });
//                         return nextResponse;
//                     }
//                 }
//                 console.log("❌ Token invalide, redirection vers /signin");
//                 const signInUrl = new URL("/signin", req.url);
//                 signInUrl.searchParams.set("next", requestedUrl.pathname);
//                 return NextResponse.redirect(signInUrl);
//             }
//         } catch (err) {
//             console.error("❌ Erreur lors de la vérification du token:", err.message);
//             const signInUrl = new URL("/signin", req.url);
//             signInUrl.searchParams.set("next", requestedUrl.pathname);
//             return NextResponse.redirect(signInUrl);
//         }
//     }

//     // ✅ Si le token existe et la route est protégée => Continue
//     return NextResponse.next();
// }

import { NextResponse } from "next/server";
import { LONG_LIFE_DURATION } from "@/utils/constants";

// 🔄 Fonction pour rafraîchir le token
async function refreshToken(refreshToken) {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
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
        const response = await fetch("http://127.0.0.1:8000/api/verify-token/", {
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
