import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const backendUrl = process.env.BACKEND_FUNNEL_URL;
  const secretToken = process.env.X_APP_SECRET_TOKEN;

  if (!backendUrl || !secretToken) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Missing required backend funnel environment variables configuration.',
      },
      { status: 500 }
    );
  }

  const cleanBaseUrl = backendUrl.replace(/\/+$/, '');
  const targetUrl = new URL(
    `${cleanBaseUrl}${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-App-Secret', secretToken);

  return NextResponse.rewrite(targetUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/api/:path*',
};
