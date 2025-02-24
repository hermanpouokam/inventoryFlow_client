import { authMiddleware } from "./middlewares/authMiddleware";
import { enterpriseMiddleware } from "./middlewares/enterpriseMiddleware";

export async function middleware(req) {
  // 🔍 Vérification de l'authentification en premier
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  // 🔍 Vérification de l'entreprise après authentification
  return enterpriseMiddleware(req);
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
  ],
};
