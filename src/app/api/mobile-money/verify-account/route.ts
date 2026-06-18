// app/api/mobile-money/verify-account/route.ts

import { getServerAuth } from "@/lib/getServerAuth";
import { NextRequest, NextResponse } from "next/server";

const MTN_BASE_URL =
    process.env.MTN_ENVIRONMENT === "production"
        ? "https://proxy.momoapi.mtn.com"
        : "https://sandbox.momodeveloper.mtn.com";

async function getMtnToken(): Promise<string> {
    const credentials = Buffer.from(
        `${process.env.MTN_API_USER}:${process.env.MTN_API_KEY}`
    ).toString("base64");

    const res = await fetch(`${MTN_BASE_URL}/collection/token/`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Ocp-Apim-Subscription-Key": process.env.MTN_SUBSCRIPTION_KEY!,
        },
    });

    if (!res.ok) {
        throw new Error(`MTN token error: ${res.status}`);
    }

    const data = await res.json();
    return data.access_token;
}

export async function POST(req: NextRequest) {
    const auth = await getServerAuth();
    if (!auth) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { phone, operator } = await req.json();

    if (!phone || typeof phone !== "string") {
        return NextResponse.json({ error: "Numéro manquant" }, { status: 400 });
    }

    // Orange Money n'a pas d'API de vérification universelle accessible
    if (operator === "orange") {
        return NextResponse.json({ active: true, verified: false });
    }

    try {
        const token = await getMtnToken();

        const res = await fetch(
            `${MTN_BASE_URL}/collection/v1_0/accountholder/msisdn/${phone}/active`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Target-Environment": process.env.MTN_ENVIRONMENT ?? "sandbox",
                    "Ocp-Apim-Subscription-Key": process.env.MTN_SUBSCRIPTION_KEY!,
                },
            }
        );

        if (res.status === 404 || res.status === 400) {
            // 404 = compte inexistant, 400 = numéro invalide
            return NextResponse.json({ active: false, verified: true });
        }

        if (!res.ok) {
            // Autre erreur API → fail open (on laisse passer)
            console.warn("[verify-account] MTN API error:", res.status);
            return NextResponse.json({ active: true, verified: false });
        }

        const data = await res.json(); // { result: true } ou { result: false }
        return NextResponse.json({
            active: data.result === true,
            verified: true,
        });
    } catch (err) {
        // Fail open : si l'API est indisponible, on ne bloque pas l'utilisateur
        console.error("[verify-account]", err);
        return NextResponse.json({ active: true, verified: false });
    }
}
