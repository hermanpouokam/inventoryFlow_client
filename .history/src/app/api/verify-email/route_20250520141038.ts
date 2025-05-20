import { NextRequest, NextResponse } from 'next/server';
import API_URL from "@/config"

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
        return NextResponse.redirect(new URL('/email-verification/error', req.url));
    }

    try {
        const res = await fetch(`${}/verify-email/?token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.redirect(new URL('/email-verification/error', req.url));
        }

        return NextResponse.redirect(new URL('/email-verification/success', req.url));
    } catch (error) {
        return NextResponse.redirect(new URL('/email-verification/error', req.url));
    }
}
