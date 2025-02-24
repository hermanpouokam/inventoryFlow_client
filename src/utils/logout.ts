import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function handleLogout(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/signin";
  const response = NextResponse.rewrite(url);

  // 🔒 Supprimer les cookies d'authentification
  response.cookies.set("access_token", "", {
    maxAge: -1,
    path: "/",
  });
  response.cookies.set("refresh_token", "", {
    maxAge: -1,
    path: "/",
  });

  return response;
}
