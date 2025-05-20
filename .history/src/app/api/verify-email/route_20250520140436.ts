import { NextRequest, NextResponse } from 'next/server'
import API_URL from "@/config"

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
        return NextResponse.redirect('/email-verification/invalid')
    }

    try {
        const res = await fetch(`${API_URL}/verify-email/?token=${token}`, {
            method: 'GET',
        })

        if (res.ok) {
            return NextResponse.redirect('/email-verification/success')
        } else {
            return NextResponse.redirect(new URL('/email-verification/error', request.url))
        }
    } catch (error) {
        return NextResponse.redirect(new URL('/email-verification/error', request.url))
    }
}
