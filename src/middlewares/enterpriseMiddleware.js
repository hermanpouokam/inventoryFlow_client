import { NextResponse } from "next/server";
import API_URL from "@/config";

export async function enterpriseMiddleware(req) {
    const token = req.cookies.get("access_token")?.value;
    const requestedUrl = req.nextUrl.clone();
    const pathname = requestedUrl.pathname;

    // 🚀 Routes accessibles sans entreprise
    const allowedWithoutEnterprise = [
        "/signup/create_enterprise"
    ];

    const allowedWithEnterpriseNotPlan = [
        "/signup/select_plan",
        "/signup/checkout",
    ];

    try {
        // 🔍 Récupère les informations de l'utilisateur
        const userResponse = await fetch(`${API_URL}/current-user/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (userResponse.ok) {
            const userData = await userResponse.json();
            // 🔎 Si l'utilisateur n'a pas d'entreprise
            if (!userData.enterprise) {
                // ✅ Accès uniquement aux pages autorisées
                if (allowedWithoutEnterprise.some(route => pathname.startsWith(route))) {
                    console.log("✅ Accès autorisé sans entreprise :", pathname);
                    return NextResponse.next();
                }

                // 🚫 Redirection pour toutes les autres pages protégées
                console.log("🔄 Redirection vers /signup/create_enterprise");
                return NextResponse.redirect(new URL("/signup/create_enterprise", req.url));
            } else {
                // if (!userData.enterprise_details.plan||userData.enterprise_details.plan.id != 1) {
                //     if (allowedWithEnterpriseNotPlan.some(route => pathname.startsWith(route))) {
                //         return NextResponse.redirect(new URL("/dashboard", req.url));
                //     }
                // }
                if (allowedWithoutEnterprise.some(route => pathname.startsWith(route))) {
                    return NextResponse.redirect(new URL("/dashboard", req.url));
                }
            }
        }

        // ✅ Si aucun problème, continuer normalement
        return null;
    } catch (err) {
        console.error("❌ Erreur lors de la récupération de l'utilisateur:", err.message);
        return NextResponse.next();
    }
}
