import { NextResponse } from "next/server";

export async function enterpriseMiddleware(req) {
    const token = req.cookies.get("access_token")?.value;
    const requestedUrl = req.nextUrl.clone();
    const pathname = requestedUrl.pathname;

    // 🚀 Routes accessibles sans entreprise
    const allowedWithoutEnterprise = [
        "/signup/select_plan",
        "/signup/create_enterprise"
    ];
    console.log("✅ enterprise middleware:");

    try {
        // 🔍 Récupère les informations de l'utilisateur
        const userResponse = await fetch(`http://127.0.0.1:8000/api/current-user/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log("✅ User Data:", userData);

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
            }
        }

        // ✅ Si aucun problème, continuer normalement
        return NextResponse.next();
    } catch (err) {
        console.error("❌ Erreur lors de la récupération de l'utilisateur:", err.message);
        return NextResponse.next();
    }
}
