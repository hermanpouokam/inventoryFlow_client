import { NextRequest, NextResponse } from 'next/server';
import { fallbackLng, languages } from '@/i18n/config';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const pathnameIsMissingLocale = languages.every(
    (locale) => !pathname.startsWith(`/${locale}/`)
  );

  if (pathnameIsMissingLocale) {
    const locale =
      request.cookies.get('i18next')?.value ||
      request.headers.get('Accept-Language')?.split(',')[0]?.split('-')[0] ||
      fallbackLng;

    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)'],
};
