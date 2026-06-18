// app/api/notchpay/verify-account/route.ts
// Vérifie qu'un numéro Mobile Money est actif via l'API NotchPay.
// Remplace l'ancienne vérification native MTN (sandbox.momodeveloper.mtn.com).

import { getServerAuth } from "@/lib/getServerAuth";
import { NextRequest, NextResponse } from "next/server";

const NOTCHPAY_ENV = process.env.NOTCHPAY_ENV ?? "sandbox";

const NOTCHPAY_BASE_URL =
    NOTCHPAY_ENV === "live"
        ? "https://api.notchpay.co"
        : "https://sandbox.notchpay.co";

export async function POST(req: NextRequest) {
    const auth = await getServerAuth();
    if (!auth) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { phone, operator } = await req.json();

    if (!phone || typeof phone !== "string") {
        return NextResponse.json({ error: "Numéro manquant" }, { status: 400 });
    }

    try {
        // NotchPay expose un endpoint de résolution de compte
        const res = await fetch(
            `${NOTCHPAY_BASE_URL}/resolve/${phone}`,
            {
                headers: {
                    Authorization: process.env.NOTCHPAY_PUBLIC_KEY!,
                    "X-Grant": process.env.NOTCHPAY_PRIVATE_KEY!,
                    Accept: "application/json",
                },
            }
        );

        if (res.status === 404 || res.status === 400) {
            // Compte inexistant ou numéro invalide
            return NextResponse.json({ active: false, verified: true });
        }

        if (!res.ok) {
            // Fail open : si l'API est indisponible, on ne bloque pas l'utilisateur
            console.warn("[notchpay/verify-account] API error:", res.status);
            return NextResponse.json({ active: true, verified: false });
        }

        const data = await res.json();
        // NotchPay retourne { account: { status: "active" | "inactive" } }
        const isActive =
            data?.account?.status === "active" ||
            data?.status === "active" ||
            data?.active === true;

        return NextResponse.json({ active: isActive, verified: true });
    } catch (err) {
        // Fail open
        console.error("[notchpay/verify-account]", err);
        return NextResponse.json({ active: true, verified: false });
    }
}
