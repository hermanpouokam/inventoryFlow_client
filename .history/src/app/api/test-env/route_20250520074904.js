// app/api/test-env/route.js
export async function GET() {
  return Response.json({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? 'undefined',
    NODE_ENV: process.env.NODE_ENV ?? 'undefined',
  });
}
