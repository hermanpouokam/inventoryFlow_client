// middlewares/permissionsMiddleware.js
import { NextResponse } from "next/server";
import { PAGE_PERMISSIONS } from "../utils/pagePermissions";
import API_URL from "@/config";

export async function permissionsMiddleware(req) {
  const token = req.cookies.get("access_token")?.value;
  const pathname = req.nextUrl.pathname;

  try {
    //  Récupérer les infos utilisateur (y compris les permissions)
    const userResponse = await fetch(`${API_URL}/current-user/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    const user = await userResponse.json();
    const mapPermissions = user.permissions.map((el) => {
      return el.id;
    });
    //  Vérification des permissions
    const requiredPermission = PAGE_PERMISSIONS[pathname];
    if (
      requiredPermission &&
      !mapPermissions.includes(requiredPermission)
    ) {
      console.log(
        ` Accès refusé : ${pathname} (Permission requise: ${requiredPermission})`
      );
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}
