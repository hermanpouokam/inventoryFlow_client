import { NextResponse } from "next/server";

export async function GET() {
    
    const response = NextResponse.redirect("/signin");

    response.cookies.set("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
    });

    response.cookies.set("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
    });

    return response;
}
