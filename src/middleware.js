import { authMiddleware } from "./middlewares/authMiddleware";
import { enterpriseMiddleware } from "./middlewares/enterpriseMiddleware";
import { permissionsMiddleware } from "./middlewares/permissionsMiddleware";

export async function middleware(req) {
  console.log("✅ Middleware exécuté :", req.nextUrl.pathname);

  const authResponse = await authMiddleware(req);
  if (authResponse) {
    console.log("🔒 Bloqué par authMiddleware");
    return authResponse;
  }

  const enterpriseResponse = await enterpriseMiddleware(req);
  if (enterpriseResponse) {
    console.log("🏢 Bloqué par enterpriseMiddleware");
    return enterpriseResponse;
  }

  console.log("🔍 Vérification des permissions en cours...");
  return await permissionsMiddleware(req);
}

export const config = {
  matcher: [
    "/signin",
    "/signup/:path*",
    "/dashboard/:path*",
    "/customer/:path*",
    "/sell/:path*",
    "/stock/:path*",
    "/enterprise/:path*",
    "/settings/:path*",
    "/finances/:path*",
  ],
};
