import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { theme } = await req.json();

    const response = NextResponse.json({ success: true });

    response.cookies.set('theme', theme, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
    });

    return response;
}